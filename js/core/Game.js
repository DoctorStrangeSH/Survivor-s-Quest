import { Player } from '../entities/Player.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { Renderer } from '../systems/Renderer.js';
import { PickupSystem } from '../systems/PickupSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { I18n } from '../utils/I18n.js';
import { AudioManager } from '../utils/AudioManager.js';

export class Game {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Утилиты
        this.i18n = new I18n();
        this.audio = new AudioManager();
        
        // Игровые объекты (создаются при старте)
        this.player = null;
        this.enemySystem = null;
        this.weaponSystem = null;
        this.waveSystem = null;
        this.renderer = null;
        this.pickupSystem = null;
        this.ui = null;
        
        // Состояние игры
        this.gameTime = 0;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.state = 'menu'; // menu, playing, paused, levelup, dead
        this.keys = {};
        this.levelUpOptions = [];
        
        // Лимиты
        this.MAX_WEAPONS = 6;
        this.MAX_PASSIVES = 6;
        
        // Статистика
        this.totalKills = 0;
        this.totalGold = 0;
        
        // Биндинг gameLoop
        this.gameLoop = this.gameLoop.bind(this);
        
        console.log('🎮 Game instance created');
    }

    async init() {
        try {
            console.log('🔧 Starting initialization...');
            
            // Инициализация переводов
            await this.i18n.init();
            console.log('✅ i18n loaded:', this.i18n.getLocale());
            
            // Создаем игровые системы
            this.player = new Player();
            this.enemySystem = new EnemySystem();
            this.weaponSystem = new WeaponSystem(this.player);
            this.waveSystem = new WaveSystem();
            this.renderer = new Renderer(this.canvas, this.ctx);
            this.pickupSystem = new PickupSystem(this.player);
            
            // UI создаем последним (зависит от game)
            this.ui = new UIManager(this);
            
            // Настройка управления
            this.setupInput();
            
            // Настройка отрисовки
            this.renderer.resize();
            window.addEventListener('resize', () => {
                this.renderer.resize();
            });
            
            // Обработчик видимости страницы
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && this.state === 'playing') {
                    this.togglePause();
                }
            });
            
            console.log('✅ Game fully initialized');
            console.log('📋 Controls: WASD/Arrows - Move | ESC - Pause | 1-4 - Select upgrade');
            
        } catch (error) {
            console.error('❌ Init failed:', error);
            throw error;
        }
    }

    setupInput() {
        // Клавиатура
        window.addEventListener('keydown', (e) => {
            // Сохраняем состояние клавиши
            this.keys[e.code] = true;
            
            // Пауза (ESC или P)
            if (e.code === 'Escape' || e.code === 'KeyP') {
                e.preventDefault();
                this.togglePause();
                return;
            }
            
            // Выбор улучшения при levelup (цифры 1-4)
            if (this.state === 'levelup') {
                const numMap = {
                    'Digit1': 0, 'Numpad1': 0,
                    'Digit2': 1, 'Numpad2': 1,
                    'Digit3': 2, 'Numpad3': 2,
                    'Digit4': 3, 'Numpad4': 3
                };
                
                if (numMap[e.code] !== undefined) {
                    e.preventDefault();
                    this.selectLevelUpOption(numMap[e.code]);
                    return;
                }
            }
            
            // Переключение языка (Ctrl + L)
            if (e.code === 'KeyL' && e.ctrlKey) {
                e.preventDefault();
                this.i18n.toggleLocale();
                console.log('🌐 Language:', this.i18n.getLocale());
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Предотвращаем контекстное меню по правой кнопке
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        console.log('✅ Input system ready');
    }

    start() {
        console.log('🚀 Starting new game...');
        
        // Полный сброс всех систем
        this.player = new Player();
        this.enemySystem = new EnemySystem();
        this.weaponSystem = new WeaponSystem(this.player);
        this.waveSystem = new WaveSystem();
        this.pickupSystem = new PickupSystem(this.player);
        
        // Сброс времени
        this.gameTime = 0;
        this.totalKills = 0;
        this.totalGold = 0;
        
        // Запуск
        this.lastTime = performance.now();
        this.state = 'playing';
        
        // Скрываем все меню
        if (this.ui) {
            this.ui.hideAll();
        }
        
        // Запускаем игровой цикл
        requestAnimationFrame(this.gameLoop);
        
        console.log('✅ Game started!');
    }

    gameLoop(currentTime) {
        // Вычисляем deltaTime
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        
        // Ограничиваем deltaTime чтобы избежать рывков
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }
        if (this.deltaTime <= 0) {
            this.deltaTime = 0.016; // ~60 FPS
        }
        
        this.lastTime = currentTime;
        
        // Обновление игры
        if (this.state === 'playing') {
            this.update(this.deltaTime);
        }
        
        // Отрисовка
        this.render();
        
        // Обновление UI
        if (this.ui) {
            this.ui.update();
        }
        
        // Продолжаем цикл
        requestAnimationFrame(this.gameLoop);
    }

    update(dt) {
        // Обновляем время
        this.gameTime += dt;
        
        // === Движение игрока ===
        let dx = 0, dy = 0;
        
        // WASD и стрелки (используем code для любой раскладки)
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;
        
        // Нормализация движения
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        
        // Перемещаем игрока
        this.player.move(dx, dy, dt);
        
        // === Обновление игровых систем ===
        this.waveSystem.update(dt, this.gameTime);
        this.enemySystem.update(dt, this.player, this.waveSystem);
        this.weaponSystem.update(dt, this.enemySystem.enemies);
        this.pickupSystem.update(dt);
        
        // === Проверка коллизий ===
        this.checkPlayerCollisions();
        this.checkProjectileCollisions();
        this.checkPickupCollisions();
        
        // === Проверка повышения уровня ===
        if (this.player.exp >= this.player.expToNext) {
            this.levelUp();
        }
    }

    checkPlayerCollisions() {
        // Если игрок неуязвим - пропускаем
        if (this.player.invincible > 0) return;
        
        const enemies = this.enemySystem.enemies;
        
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.player.radius + enemy.radius;
            
            if (dist < minDist) {
                // Наносим урон игроку
                const damage = Math.max(1, enemy.damage - this.player.armor);
                this.player.hp -= damage;
                
                // Отбрасывание игрока
                if (dist > 0) {
                    const knockback = 100;
                    this.player.x += (dx / dist) * knockback * 0.016;
                    this.player.y += (dy / dist) * knockback * 0.016;
                }
                
                // Активируем неуязвимость
                this.player.invincible = this.player.invincibleDuration;
                
                // Звук получения урона
                this.audio.play('damage');
                
                // Проверка смерти
                if (this.player.hp <= 0) {
                    this.player.hp = 0;
                    this.player.alive = false;
                    this.die();
                    return;
                }
                
                // Выходим после первого же столкновения
                break;
            }
        }
    }

    checkProjectileCollisions() {
        const projectiles = this.weaponSystem.projectiles;
        const enemies = this.enemySystem.enemies;
        
        // Для каждого снаряда
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            let projectileHit = false;
            
            // Проверяем всех врагов
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                const dx = proj.x - enemy.x;
                const dy = proj.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const hitDist = (proj.radius || 5) + enemy.radius;
                
                if (dist < hitDist) {
                    // Наносим урон врагу
                    enemy.hp -= proj.damage;
                    enemy.hitFlash = 0.1;
                    
                    // Эффект при попадании
                    if (proj.onHit) {
                        proj.onHit(enemy, this.weaponSystem.effects);
                    }
                    
                    // Звук попадания
                    this.audio.play('hit');
                    
                    // Проверка смерти врага
                    if (enemy.hp <= 0) {
                        this.onEnemyKilled(enemy);
                        enemies.splice(j, 1);
                    }
                    
                    projectileHit = true;
                    
                    // Если снаряд не пробивающий - прекращаем проверку
                    if (!proj.piercing) {
                        break;
                    }
                }
            }
            
            // Удаляем снаряд если он попал и не пробивающий
            if (projectileHit && !proj.piercing) {
                projectiles.splice(i, 1);
            }
        }
    }

    checkPickupCollisions() {
        const pickups = this.pickupSystem.pickups;
        
        for (let i = pickups.length - 1; i >= 0; i--) {
            const pickup = pickups[i];
            const dx = this.player.x - pickup.x;
            const dy = this.player.y - pickup.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.player.radius + 15) {
                this.collectPickup(pickup);
                pickups.splice(i, 1);
            }
        }
    }

    collectPickup(pickup) {
        switch(pickup.type) {
            case 'exp':
                this.player.exp += pickup.value;
                break;
            case 'gold':
                this.player.gold += pickup.value;
                this.totalGold += pickup.value;
                break;
            case 'health':
                this.player.heal(pickup.value);
                break;
            case 'treasure':
                const bonus = Math.floor(pickup.value * this.player.greed);
                this.player.gold += bonus;
                this.totalGold += bonus;
                break;
        }
        
        this.audio.play('pickup');
    }

    onEnemyKilled(enemy) {
        // Статистика
        this.player.kills++;
        this.totalKills++;
        
        // Опыт
        this.player.addExp(enemy.exp);
        
        // Звук
        this.audio.play('kill');
        
        // Дроп опыта (40% шанс)
        if (Math.random() < 0.4) {
            this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'exp');
        }
        
        // Дроп золота (10% шанс)
        if (Math.random() < 0.1) {
            this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'gold');
        }
        
        // Дроп здоровья если HP < 50% (5% шанс)
        if (this.player.hp < this.player.maxHp * 0.5 && Math.random() < 0.05) {
            this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'health');
        }
    }

    levelUp() {
        console.log(`⬆️ Level Up! ${this.player.level} -> ${this.player.level + 1}`);
        
        // Повышаем уровень
        this.player.level++;
        
        // Переносим излишек опыта
        this.player.exp -= this.player.expToNext;
        
        // Увеличиваем требования для следующего уровня
        this.player.expToNext = Math.floor(this.player.expToNext * 1.2);
        
        // Небольшое лечение при повышении уровня
        this.player.heal(10);
        
        // Звук
        this.audio.play('levelup');
        
        // Показываем меню выбора
        this.state = 'levelup';
        this.levelUpOptions = this.generateLevelUpOptions();
        this.ui.showLevelUp(this.levelUpOptions);
    }

    generateLevelUpOptions() {
        const options = [];
        const currentTypes = this.weaponSystem.weapons.map(w => w.type);
        
        // Доступное оружие (все кроме хлыста, он уже есть)
        const allWeapons = [
            'magic_wand', 'garlic', 'fire_wand', 'king_bible',
            'santa_water', 'lightning_ring', 'axe', 'cross'
        ];
        
        // Добавляем новое оружие (если есть свободные слоты)
        if (this.weaponSystem.weapons.length < this.MAX_WEAPONS) {
            allWeapons.forEach(type => {
                if (!currentTypes.includes(type)) {
                    options.push({
                        type: 'weapon',
                        id: type,
                        name: this.i18n.t(`weapons.${type}`),
                        desc: this.i18n.t(`weapons.${type}_desc`),
                        icon: this.weaponSystem.getWeaponIcon(type),
                        level: 1
                    });
                }
            });
        }
        
        // Улучшение существующего оружия
        this.weaponSystem.weapons.forEach(weapon => {
            if (weapon.level < weapon.maxLevel) {
                options.push({
                    type: 'upgrade',
                    weaponType: weapon.type,
                    name: `${this.i18n.t(`weapons.${weapon.type}`)} LV${weapon.level + 1}`,
                    desc: `Уровень ${weapon.level + 1}/${weapon.maxLevel}`,
                    icon: weapon.icon,
                    level: weapon.level + 1
                });
            }
        });
        
        // Пассивные предметы
        const passives = [
            { id: 'spinach', name: 'passives.spinach', desc: 'passives.spinach_desc', icon: '🥬' },
            { id: 'armor', name: 'passives.armor', desc: 'passives.armor_desc', icon: '🛡️' },
            { id: 'hollow_heart', name: 'passives.hollow_heart', desc: 'passives.hollow_heart_desc', icon: '❤️' },
            { id: 'empty_tome', name: 'passives.empty_tome', desc: 'passives.empty_tome_desc', icon: '📖' },
            { id: 'candelabrador', name: 'passives.candelabrador', desc: 'passives.candelabrador_desc', icon: '🕯️' },
            { id: 'spellbinder', name: 'passives.spellbinder', desc: 'passives.spellbinder_desc', icon: '🔮' },
            { id: 'duplicator', name: 'passives.duplicator', desc: 'passives.duplicator_desc', icon: '🔄' },
            { id: 'attractorb', name: 'passives.attractorb', desc: 'passives.attractorb_desc', icon: '🧲' }
        ];
        
        passives.forEach(p => {
            options.push({
                type: 'passive',
                id: p.id,
                name: this.i18n.t(p.name),
                desc: this.i18n.t(p.desc),
                icon: p.icon,
                level: 1
            });
        });
        
        // Перемешиваем все опции
        this.shuffleArray(options);
        
        // Возвращаем 4 случайных опции
        return options.slice(0, Math.min(4, options.length));
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    selectLevelUpOption(index) {
        if (index < 0 || index >= this.levelUpOptions.length) {
            console.warn('Invalid option index:', index);
            return;
        }
        
        const option = this.levelUpOptions[index];
        console.log('Selected:', option);
        
        switch(option.type) {
            case 'weapon':
                this.weaponSystem.addWeapon(option.id);
                break;
                
            case 'upgrade':
                this.weaponSystem.upgradeWeapon(option.weaponType);
                break;
                
            case 'passive':
                this.applyPassive(option.id);
                break;
        }
        
        // Возвращаемся в игру
        this.state = 'playing';
        this.ui.hideLevelUp();
        this.lastTime = performance.now();
    }

    applyPassive(type) {
        console.log(`Applying passive: ${type}`);
        
        switch(type) {
            case 'spinach':
                this.player.might += 0.1;
                console.log(`  Might: ${this.player.might.toFixed(1)}`);
                break;
            case 'armor':
                this.player.armor += 1;
                console.log(`  Armor: ${this.player.armor}`);
                break;
            case 'hollow_heart':
                const bonus = Math.floor(this.player.maxHp * 0.2);
                this.player.maxHp += bonus;
                this.player.hp += bonus;
                console.log(`  Max HP: ${this.player.maxHp}`);
                break;
            case 'empty_tome':
                this.player.cooldown += 0.08;
                console.log(`  Cooldown: ${this.player.cooldown.toFixed(2)}`);
                break;
            case 'candelabrador':
                this.player.area += 0.1;
                console.log(`  Area: ${this.player.area.toFixed(1)}`);
                break;
            case 'spellbinder':
                this.player.duration += 0.1;
                console.log(`  Duration: ${this.player.duration.toFixed(1)}`);
                break;
            case 'duplicator':
                this.player.amount += 1;
                console.log(`  Amount: ${this.player.amount}`);
                break;
            case 'attractorb':
                this.player.magnet += 1;
                console.log(`  Magnet: ${this.player.magnet}`);
                break;
            default:
                console.warn(`Unknown passive: ${type}`);
        }
        
        // Добавляем в список пассивок игрока
        this.player.addPassive(type);
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.ui.showPause();
            console.log('⏸️ Paused');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.lastTime = performance.now();
            this.ui.hidePause();
            console.log('▶️ Resumed');
        }
    }

    die() {
        console.log('💀 Player died!');
        
        this.state = 'dead';
        this.player.alive = false;
        
        // Звук смерти
        this.audio.play('death');
        
        // Сохраняем рекорд
        const record = parseInt(localStorage.getItem('survivor-record') || '0');
        if (this.player.kills > record) {
            localStorage.setItem('survivor-record', this.player.kills.toString());
            console.log(`🏆 New record: ${this.player.kills} kills!`);
        }
        
        // Показываем экран смерти
        this.ui.showDeath(this.player, {
            time: this.gameTime,
            kills: this.player.kills,
            level: this.player.level,
            wave: this.waveSystem.getWave(),
            record: Math.max(record, this.player.kills)
        });
    }

    render() {
        // Очистка экрана
        this.renderer.clear();
        
        // Отрисовка фона (сетка)
        this.renderer.drawGrid(this.player);
        
        // Отрисовка пикапов (под врагами)
        this.renderer.drawPickups(this.pickupSystem.pickups, this.player);
        
        // Отрисовка врагов
        this.renderer.drawEnemies(this.enemySystem.enemies, this.player);
        
        // Отрисовка снарядов
        this.weaponSystem.projectiles.forEach(proj => {
            const sx = this.canvas.width / 2 + (proj.x - this.player.x);
            const sy = this.canvas.height / 2 + (proj.y - this.player.y);
            
            // Снаряд
            this.ctx.fillStyle = proj.color || '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, proj.radius || 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Свечение
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, (proj.radius || 4) * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Отрисовка визуальных эффектов
        this.weaponSystem.effects.forEach(effect => {
            if (effect.life <= 0) return;
            
            const sx = this.canvas.width / 2 + (effect.x - this.player.x);
            const sy = this.canvas.height / 2 + (effect.y - this.player.y);
            const alpha = Math.max(0, effect.life / effect.maxLife);
            
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = effect.color;
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, effect.size || 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        
        // Отрисовка луж (Santa Water)
        this.weaponSystem.weapons.forEach(weapon => {
            if (weapon.getPuddles) {
                weapon.getPuddles().forEach(puddle => {
                    const sx = this.canvas.width / 2 + (puddle.x - this.player.x);
                    const sy = this.canvas.height / 2 + (puddle.y - this.player.y);
                    const alpha = Math.min(1, puddle.life / 3);
                    
                    this.ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.3})`;
                    this.ctx.beginPath();
                    this.ctx.arc(sx, sy, puddle.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.5})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                });
            }
        });
        
        // Отрисовка игрока
        this.renderer.drawPlayer(this.player);
        
        // Отрисовка HUD
        this.drawHUD();
    }

    drawHUD() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // === Верхняя панель ===
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, w, 38);
        
        // Линия снизу панели
        ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.fillRect(0, 38, w, 2);
        
        // Текст статистики
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Inter", sans-serif';
        ctx.textAlign = 'left';
        
        // HP
        const hpPercent = Math.ceil((this.player.hp / this.player.maxHp) * 100);
        const hpColor = hpPercent > 50 ? '#4ade80' : hpPercent > 25 ? '#fbbf24' : '#ef4444';
        ctx.fillStyle = hpColor;
        ctx.fillText(`❤️`, 15, 26);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${Math.ceil(this.player.hp)}/${this.player.maxHp}`, 35, 26);
        
        // Level
        ctx.fillText(`⭐ LV${this.player.level}`, 170, 26);
        
        // EXP
        ctx.fillStyle = '#a855f7';
        ctx.fillText(`💎`, 280, 26);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${this.player.exp}/${this.player.expToNext}`, 300, 26);
        
        // Wave
        ctx.fillText(`🌊 ${this.waveSystem.getWave()}`, 430, 26);
        
        // Time
        const mins = Math.floor(this.gameTime / 60);
        const secs = Math.floor(this.gameTime % 60);
        ctx.fillText(`⏱ ${mins}:${secs.toString().padStart(2, '0')}`, 540, 26);
        
        // Kills
        ctx.fillText(`💀 ${this.player.kills}`, 680, 26);
        
        // Gold
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`🪙 ${this.player.gold}`, 780, 26);
        
        // === Нижняя панель с оружием ===
        if (this.weaponSystem.weapons.length > 0) {
            const panelY = h - 50;
            
            // Фон панели
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, panelY, w, 50);
            
            // Линия сверху панели
            ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
            ctx.fillRect(0, panelY, w, 2);
            
            // Оружие
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            
            this.weaponSystem.weapons.forEach((weapon, i) => {
                const x = 35 + i * 60;
                const y = panelY + 18;
                
                // Слот оружия
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fillRect(x - 22, panelY + 5, 44, 40);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x - 22, panelY + 5, 44, 40);
                
                // Иконка
                ctx.font = '18px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(weapon.icon, x, y);
                
                // Уровень
                ctx.font = '9px "Inter", sans-serif';
                ctx.fillStyle = '#a855f7';
                ctx.fillText(`LV${weapon.level}`, x, y + 15);
            });
        }
    }

    // Вспомогательные методы
    getState() {
        return this.state;
    }

    getPlayer() {
        return this.player;
    }

    getGameTime() {
        return this.gameTime;
    }

    getWave() {
        return this.waveSystem ? this.waveSystem.getWave() : 1;
    }
}