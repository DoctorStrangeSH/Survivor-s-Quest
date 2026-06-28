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
import { I18n } from '../utils/I18n.js';

export class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.state = new StateManager();
        this.eventBus = eventBus;
        this.i18n = new I18n();
        
        // Игровые системы
        this.player = null;
        this.enemySystem = null;
        this.weaponSystem = null;
        this.abilitySystem = null;
        this.waveSystem = null;
        
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
    }

    async init() {
        // Инициализация i18n
        await this.i18n.init();
        
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Системы
        this.inputManager = new InputManager();
        this.audioManager = new AudioManager();
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.player = new Player();
        this.enemySystem = new EnemySystem();
        this.weaponSystem = new WeaponSystem(this.player);
        this.abilitySystem = new AbilitySystem(this.player);
        this.waveSystem = new WaveSystem(this.enemySystem);
        
        // UI
        this.uiManager = new UIManager(this);
        
        // События
        this.setupEvents();
        
        // Обработчики окна
        window.addEventListener('resize', () => this.renderer.resize());
        this.renderer.resize();
        
        // Показываем выбор языка
        this.state.set(GameState.MENU);
        document.getElementById('languageSelector').classList.remove('hidden');
        
        console.log('Game initialized successfully');
    }

    setupEvents() {
        // События игрока
        this.eventBus.on('player:damaged', ({ damage, hp, maxHp }) => {
            this.audioManager.play('hit');
            this.uiManager.updateHP(hp, maxHp);
        });

        this.eventBus.on('player:healed', ({ amount, hp, maxHp }) => {
            this.audioManager.play('heal');
            this.uiManager.updateHP(hp, maxHp);
        });

        this.eventBus.on('player:levelup', (level) => {
            this.audioManager.play('levelup');
            this.state.set(GameState.LEVELUP);
            this.uiManager.showLevelUpMenu();
        });

        this.eventBus.on('player:death', () => {
            this.state.set(GameState.DEAD);
            this.uiManager.showDeathScreen();
        });

        this.eventBus.on('player:exp', ({ current, max }) => {
            this.uiManager.updateEXP(current, max);
        });

        this.eventBus.on('player:gold', (gold) => {
            this.uiManager.updateGold(gold);
        });

        this.eventBus.on('player:kills', (kills) => {
            this.uiManager.updateKills(kills);
        });

        // События врагов
        this.eventBus.on('enemy:killed', (enemy) => {
            this.player.addExperience(enemy.exp);
            this.player.addGold(enemy.gold);
            this.player.addKill();
        });

        // События волн
        this.eventBus.on('wave:changed', (wave) => {
            this.uiManager.updateWave(wave);
        });

        // События UI
        this.eventBus.on('ui:shop:open', () => {
            this.state.set(GameState.SHOP);
        });

        this.eventBus.on('ui:shop:close', () => {
            this.state.set(GameState.PLAYING);
        });
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.state.set(GameState.PLAYING);
        document.getElementById('languageSelector').classList.add('hidden');
        
        // Запускаем игровой цикл
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        // Ограничиваем дельту для предотвращения рывков
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        this.lastTime = currentTime;
        
        if (this.state.is(GameState.PLAYING)) {
            this.update(this.deltaTime);
        }
        
        this.render();
        this.uiManager.update();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(dt) {
        this.gameTime += dt;
        
        // Обновление систем
        this.player.update(dt, this.inputManager);
        this.waveSystem.update(dt);
        this.enemySystem.update(dt, this.player);
        this.weaponSystem.update(dt, this.enemySystem.getEnemies());
        this.abilitySystem.update(dt);
        
        // Проверка коллизий
        this.checkCollisions();
        
        // Обновление таймера
        this.uiManager.updateTimer(this.gameTime);
    }

    checkCollisions() {
        const enemies = this.enemySystem.getEnemies();
        const projectiles = this.weaponSystem.getProjectiles();
        
        // Снаряды x Враги
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (projectile.collidesWith(enemy)) {
                    enemy.takeDamage(projectile.damage);
                    projectile.onHit(enemy);
                    
                    if (enemy.isDead()) {
                        this.eventBus.emit('enemy:killed', enemy);
                        enemies.splice(j, 1);
                    }
                    
                    projectiles.splice(i, 1);
                    break;
                }
            }
        }
        
        // Игрок x Враги
        enemies.forEach(enemy => {
            if (enemy.collidesWith(this.player) && !this.player.isInvincible()) {
                this.player.takeDamage(enemy.damage);
                this.eventBus.emit('player:damaged', {
                    damage: enemy.damage,
                    hp: this.player.hp,
                    maxHp: this.player.maxHp
                });
            }
        });
    }

    render() {
        this.renderer.clear();
        this.renderer.drawGrid();
        this.renderer.drawEffects(this.weaponSystem.getEffects());
        this.renderer.drawProjectiles(this.weaponSystem.getProjectiles());
        this.renderer.drawEnemies(this.enemySystem.getEnemies());
        this.renderer.drawPlayer(this.player);
        this.renderer.drawFloatingTexts();
    }

    pause() {
        this.state.set(GameState.PAUSED);
        this.uiManager.showPauseMenu();
    }

    resume() {
        this.state.set(GameState.PLAYING);
        this.lastTime = performance.now();
        this.uiManager.hideAllMenus();
    }

    restart() {
        this.player.reset();
        this.enemySystem.reset();
        this.weaponSystem.reset();
        this.abilitySystem.reset();
        this.waveSystem.reset();
        this.gameTime = 0;
        this.uiManager.hideAllMenus();
        this.start();
    }

    getGameTime() {
        return this.gameTime;
    }
}