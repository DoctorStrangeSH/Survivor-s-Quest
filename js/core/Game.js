import { StateManager, GameState } from './State.js';
import { EventBus, eventBus } from './EventBus.js';
import { Player } from '../entities/Player.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { AbilitySystem } from '../systems/AbilitySystem.js';
import { UIManager } from '../ui/UIManager.js';
import { InputManager } from '../systems/InputManager.js';
import { AudioManager } from '../utils/AudioManager.js';
import { Renderer } from '../systems/Renderer.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { I18n } from '../utils/I18n.js';
import { StorageManager } from '../utils/StorageManager.js';

export class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.state = new StateManager();
        this.eventBus = eventBus;
        this.i18n = null;
        
        // Игровые системы
        this.player = null;
        this.enemySystem = null;
        this.weaponSystem = null;
        this.abilitySystem = null;
        this.waveSystem = null;
        this.upgradeSystem = null;
        
        // Управление
        this.inputManager = null;
        this.audioManager = null;
        this.renderer = null;
        this.uiManager = null;
        
        // Игровое время
        this.gameTime = 0;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.isRunning = false;
        
        // Статистика
        this.stats = {
            totalKills: 0,
            totalGold: 0,
            maxLevel: 1,
            maxWave: 1,
            playTime: 0
        };
        
        // Отладка
        this.debugMode = false;
        this.fpsCounter = 0;
        this.fpsTimer = 0;
        this.currentFPS = 0;
        
        // Привязка методов
        this.gameLoop = this.gameLoop.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    async init() {
        try {
            console.log('🎮 Initializing game...');
            
            // Инициализация i18n
            this.i18n = new I18n();
            await this.i18n.init();
            console.log('✅ i18n initialized');
            
            // Canvas
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) throw new Error('Canvas element #gameCanvas not found');
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) throw new Error('Canvas 2D context not available');
            console.log('✅ Canvas initialized');
            
            // Инициализация всех систем
            await this.initializeSystems();
            
            // Настройка событий
            this.setupEvents();
            this.setupGlobalEvents();
            
            // Обработчики окна
            window.addEventListener('resize', () => {
                this.renderer.resize();
                this.gradientCache?.clear();
            });
            
            this.renderer.resize();
            
            // Загружаем рекорды
            this.loadRecords();
            
            // Показываем выбор языка
            this.state.set(GameState.MENU);
            this.showLanguageSelector();
            
            console.log('✅ Game initialization complete');
            console.log('🎯 Press RU or EN button to start!');
            
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            this.showError(error.message);
            throw error;
        }
    }

    async initializeSystems() {
        // Создаем системы в правильном порядке
        this.inputManager = new InputManager();
        this.audioManager = new AudioManager();
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.player = new Player();
        this.enemySystem = new EnemySystem();
        this.weaponSystem = new WeaponSystem(this.player);
        this.abilitySystem = new AbilitySystem(this.player);
        this.waveSystem = new WaveSystem(this.enemySystem);
        this.upgradeSystem = new UpgradeSystem();
        
        // UI создаем последним, так как он зависит от всех систем
        this.uiManager = new UIManager(this);
        
        console.log('✅ All systems initialized');
    }

    setupEvents() {
        // === События игрока ===
        
        this.eventBus.on('player:damaged', ({ damage, hp, maxHp }) => {
            this.audioManager.play('hit');
            this.uiManager.updateHP(hp, maxHp);
        });

        this.eventBus.on('player:healed', ({ amount, hp, maxHp }) => {
            this.audioManager.play('heal');
            this.uiManager.updateHP(hp, maxHp);
            this.uiManager.addFloatingText(
                this.player.x,
                this.player.y - 30,
                `+${Math.ceil(amount)}`,
                '#4ade80',
                1
            );
        });

        this.eventBus.on('player:levelup', (level) => {
            this.audioManager.play('levelup');
            this.state.set(GameState.LEVELUP);
            this.uiManager.showLevelUpMenu();
            this.uiManager.updateLevel(level);
            this.stats.maxLevel = Math.max(this.stats.maxLevel, level);
            
            // Эффект Level Up
            this.uiManager.addFloatingText(
                this.player.x,
                this.player.y - 40,
                `LEVEL ${level}!`,
                '#fbbf24',
                2
            );
        });

        this.eventBus.on('player:death', () => {
            this.state.set(GameState.DEAD);
            this.saveRecords();
            
            this.uiManager.showDeathScreen({
                kills: this.player.kills,
                time: this.gameTime,
                gold: this.player.gold,
                wave: this.waveSystem.getWaveNumber()
            });
        });

        this.eventBus.on('player:exp', ({ current, max }) => {
            this.uiManager.updateEXP(current, max);
        });

        this.eventBus.on('player:gold', (gold) => {
            this.uiManager.updateGold(gold);
        });

        this.eventBus.on('player:kills', (kills) => {
            this.uiManager.updateKills(kills);
            this.stats.totalKills++;
        });

        // === События врагов ===
        
        this.eventBus.on('enemy:killed', (enemy) => {
            this.player.addExperience(enemy.exp);
            this.player.addGold(enemy.gold);
            this.player.addKill();
            this.audioManager.play('kill');
            
            // Текст опыта
            if (enemy.exp > 0) {
                this.uiManager.addFloatingText(
                    enemy.x,
                    enemy.y - 20,
                    `+${enemy.exp} XP`,
                    '#a855f7',
                    1
                );
            }
            
            // Текст золота
            if (enemy.gold > 0) {
                this.uiManager.addFloatingText(
                    enemy.x + 15,
                    enemy.y - 20,
                    `+${enemy.gold}💰`,
                    '#fbbf24',
                    1
                );
            }
        });

        this.eventBus.on('enemy:bossSpawned', (boss) => {
            this.audioManager.play('boss');
            this.uiManager.addFloatingText(
                boss.x,
                boss.y - 50,
                '⚠️ BOSS! ⚠️',
                '#ef4444',
                3
            );
        });

        // === События волн ===
        
        this.eventBus.on('wave:started', (wave) => {
            this.uiManager.updateWave(wave);
            this.stats.maxWave = Math.max(this.stats.maxWave, wave);
            this.uiManager.addFloatingText(
                this.player.x,
                this.player.y - 60,
                `ВОЛНА ${wave}`,
                '#ffffff',
                2
            );
        });

        this.eventBus.on('wave:ended', (wave) => {
            this.uiManager.addFloatingText(
                this.player.x,
                this.player.y - 60,
                `Волна ${wave} пройдена!`,
                '#4ade80',
                2
            );
        });

        this.eventBus.on('wave:bossSpawned', (boss) => {
            console.log('👑 Boss spawned!');
        });

        this.eventBus.on('player:waveBonus', ({ heal, wave }) => {
            this.player.heal(heal);
        });

        this.eventBus.on('player:waveReward', ({ gold, exp, wave }) => {
            this.player.addGold(gold);
            this.player.addExperience(exp);
            this.stats.totalGold += gold;
        });

        // === События UI ===
        
        this.eventBus.on('ui:resume', () => this.resume());
        this.eventBus.on('ui:restart', () => this.restart());
        this.eventBus.on('ui:levelup:complete', () => {
            this.state.set(GameState.PLAYING);
            this.lastTime = performance.now();
        });

        this.eventBus.on('ui:shop:open', () => {
            if (this.state.is(GameState.PLAYING)) {
                this.state.set(GameState.SHOP);
                this.uiManager.showShopMenu();
            }
        });

        this.eventBus.on('ui:shop:close', () => {
            this.state.set(GameState.PLAYING);
            this.lastTime = performance.now();
            this.uiManager.hideAllMenus();
        });

        // === События ввода ===
        
        this.eventBus.on('input:pause', () => {
            if (this.state.is(GameState.PLAYING)) {
                this.pause();
            } else if (this.state.is(GameState.PAUSED)) {
                this.resume();
            }
        });

        this.eventBus.on('input:shop', () => {
            if (this.state.is(GameState.PLAYING)) {
                this.state.set(GameState.SHOP);
                this.uiManager.showShopMenu();
            }
        });

        this.eventBus.on('input:ability', (key) => {
            if (this.state.is(GameState.PLAYING)) {
                this.abilitySystem.useAbility(key);
            }
        });

        this.eventBus.on('input:switchWeapon', (index) => {
            if (this.state.is(GameState.PLAYING)) {
                this.weaponSystem.switchWeapon(index);
            }
        });

        // === События улучшений ===
        
        this.eventBus.on('upgrade:applied', (upgrade) => {
            this.audioManager.play('buy');
            this.uiManager.addFloatingText(
                this.player.x,
                this.player.y - 50,
                upgrade.name,
                '#fbbf24',
                1.5
            );
        });

        console.log('✅ Events configured');
    }

    setupGlobalEvents() {
        // Видимость страницы
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Горячие клавиши
        window.addEventListener('keydown', (e) => {
            // F3 - режим отладки
            if (e.key === 'F3') {
                e.preventDefault();
                this.toggleDebug();
            }
            
            // F5 - предотвращаем обновление страницы
            if (e.key === 'F5') {
                e.preventDefault();
                this.restart();
            }
        });
        
        // Предотвращаем скролл на мобильных
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Обработка ошибок
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            if (this.state.is(GameState.PLAYING)) {
                this.pause();
            }
        }
    }

    showLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.classList.remove('hidden');
            
            // Обработчики для кнопок
            document.getElementById('langRu')?.addEventListener('click', () => {
                this.i18n.setLocale('ru');
                this.start();
            });
            
            document.getElementById('langEn')?.addEventListener('click', () => {
                this.i18n.setLocale('en');
                this.start();
            });
        }
    }

    start() {
        console.log('🚀 Starting game...');
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.state.set(GameState.PLAYING);
        
        // Скрываем выбор языка
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) langSelector.classList.add('hidden');
        
        // Сбрасываем статистику
        this.gameTime = 0;
        this.stats.playTime = 0;
        
        // Запускаем игровой цикл
        requestAnimationFrame(this.gameLoop);
        
        console.log('✅ Game started successfully!');
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Вычисляем deltaTime
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        
        // Ограничиваем deltaTime для предотвращения рывков
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        if (this.deltaTime <= 0) this.deltaTime = 0.016;
        
        this.lastTime = currentTime;
        
        // Счетчик FPS
        this.fpsCounter++;
        this.fpsTimer += this.deltaTime;
        if (this.fpsTimer >= 1) {
            this.currentFPS = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsTimer = 0;
        }
        
        // Обновление игры
        if (this.state.is(GameState.PLAYING)) {
            this.update(this.deltaTime);
        }
        
        // Отрисовка
        this.render();
        
        // Обновление UI
        this.uiManager.update();
        
        // Продолжаем цикл
        requestAnimationFrame(this.gameLoop);
    }

    update(dt) {
        // Проверка, жив ли игрок
        if (!this.player.alive) return;
        
        // Обновляем игровое время
        this.gameTime += dt;
        this.stats.playTime += dt;
        
        // Обновляем все системы
        this.player.update(dt, this.inputManager);
        this.waveSystem.update(dt);
        this.enemySystem.update(dt, this.player);
        this.weaponSystem.update(dt, this.enemySystem.getEnemies());
        this.abilitySystem.update(dt);
        
        // Проверка коллизий
        this.checkCollisions();
        
        // Обновление UI статистики
        this.updateUIStats();
    }

    checkCollisions() {
        const enemies = this.enemySystem.getEnemies();
        const projectiles = this.weaponSystem.getProjectiles();
        
        // Снаряды против врагов
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            let hit = false;
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                
                if (projectile.collidesWith(enemy)) {
                    // Наносим урон
                    enemy.takeDamage(projectile.damage);
                    
                    // Обратный вызов при попадании
                    if (projectile.onHit) {
                        projectile.onHit(enemy);
                    }
                    
                    // Эффект попадания
                    this.weaponSystem.spawnEffect({
                        x: projectile.x,
                        y: projectile.y,
                        vx: (Math.random() - 0.5) * 40,
                        vy: (Math.random() - 0.5) * 40,
                        life: 0.3,
                        maxLife: 0.3,
                        color: projectile.color
                    });
                    
                    hit = true;
                    
                    // Если враг умер
                    if (enemy.isDead()) {
                        this.eventBus.emit('enemy:killed', enemy);
                        enemies.splice(j, 1);
                    }
                    
                    // Если снаряд не пробивающий, выходим
                    if (!projectile.piercing) {
                        break;
                    }
                }
            }
            
            // Удаляем снаряд, если он попал и не пробивающий
            if (hit && !projectile.piercing) {
                projectiles.splice(i, 1);
            }
        }
        
        // Игрок против врагов
        for (const enemy of enemies) {
            if (enemy.collidesWith(this.player) && !this.player.isInvincible()) {
                // Наносим урон игроку
                this.player.takeDamage(enemy.damage);
                
                // Отбрасывание врага
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.hypot(dx, dy) || 1;
                
                enemy.x += (dx / dist) * 20;
                enemy.y += (dy / dist) * 20;
            }
        }
    }

    updateUIStats() {
        // Обновление времени
        this.uiManager.updateTimer(this.gameTime);
        
        // Обновление волны
        this.uiManager.updateWave(this.waveSystem.getWaveNumber());
        
        // Обновление уровня
        this.uiManager.updateLevel(this.player.level);
    }

    render() {
        // Очистка канваса
        this.renderer.clear();
        
        // Обновление камеры
        this.renderer.updateCamera(this.player);
        
        // Отрисовка сетки
        this.renderer.drawGrid();
        
        // Получаем текущее оружие
        const currentWeapon = this.weaponSystem.getCurrentWeapon();
        
        // Отрисовка ауры (под врагами)
        if (currentWeapon && typeof currentWeapon.getAuraParticles === 'function') {
            this.renderer.drawAuraParticles(this.player, currentWeapon.getAuraParticles());
        }
        
        // Отрисовка эффектов
        this.renderer.drawEffects(this.weaponSystem.getEffects());
        
        // Отрисовка снарядов
        this.renderer.drawProjectiles(this.weaponSystem.getProjectiles());
        
        // Отрисовка врагов
        this.renderer.drawEnemies(this.enemySystem.getEnemies());
        
        // Отрисовка игрока
        this.renderer.drawPlayer(this.player);
        
        // Отрисовка молний (поверх всего)
        if (currentWeapon && typeof currentWeapon.getLightningSegments === 'function') {
            this.renderer.drawLightningSegments(currentWeapon.getLightningSegments());
        }
        
        // Отрисовка плавающего текста
        this.renderer.drawFloatingTexts(this.uiManager.getFloatingTexts());
        
        // Отрисовка радиуса атаки (если не аура)
        if (currentWeapon && currentWeapon.range > 0 && 
            typeof currentWeapon.getAuraParticles !== 'function') {
            this.renderer.drawAttackRange(this.player, currentWeapon.range);
        }
        
        // Предупреждение босса
        const boss = this.enemySystem.getEnemies().find(e => e.type === 'boss');
        if (boss) {
            this.renderer.drawBossWarning(boss);
        }
        
        // Отладка
        if (this.debugMode) {
            this.renderDebugInfo();
        }
    }

    renderDebugInfo() {
        const debugInfo = {
            'FPS': this.currentFPS,
            'State': this.state.current,
            'Time': this.gameTime.toFixed(1),
            'Enemies': this.enemySystem.getEnemies().length,
            'Projectiles': this.weaponSystem.getProjectiles().length,
            'Effects': this.weaponSystem.getEffects().length,
            'Player Pos': `${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)}`,
            'Wave': this.waveSystem.getWaveNumber(),
            'Wave Timer': this.waveSystem.getTimeUntilNextWave().toFixed(1)
        };
        
        this.renderer.drawDebugInfo(debugInfo);
    }

    pause() {
        if (!this.state.is(GameState.PLAYING)) return;
        
        this.state.set(GameState.PAUSED);
        this.uiManager.showPauseMenu();
        console.log('⏸️ Game paused');
    }

    resume() {
        if (!this.state.is(GameState.PAUSED)) return;
        
        this.state.set(GameState.PLAYING);
        this.lastTime = performance.now();
        this.uiManager.hideAllMenus();
        console.log('▶️ Game resumed');
    }

    restart() {
        console.log('🔄 Restarting game...');
        
        // Сбрасываем все системы
        this.player.reset();
        this.enemySystem.reset();
        this.weaponSystem.reset();
        this.abilitySystem.reset();
        this.waveSystem.reset();
        
        // Сбрасываем время
        this.gameTime = 0;
        this.stats.playTime = 0;
        
        // Скрываем все меню
        this.uiManager.hideAllMenus();
        
        // Запускаем игру
        this.start();
    }

    loadRecords() {
        this.stats.totalKills = StorageManager.getRecord();
        console.log('📊 Records loaded');
    }

    saveRecords() {
        StorageManager.setRecord(this.player.kills);
        console.log('💾 Records saved');
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
        console.log(`🐛 Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: monospace;
            z-index: 9999;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h2>Ошибка загрузки</h2>
            <p>${message}</p>
            <button onclick="location.reload()">Перезагрузить</button>
        `;
        document.body.appendChild(errorDiv);
    }

    getGameTime() {
        return this.gameTime;
    }

    getStats() {
        return { ...this.stats };
    }
}