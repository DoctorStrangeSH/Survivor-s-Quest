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
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Сначала создаем i18n
        this.i18n = new I18n();
        this.audio = new AudioManager();
        
        // Игровые системы (создаем после i18n)
        this.player = null;
        this.enemySystem = null;
        this.weaponSystem = null;
        this.waveSystem = null;
        this.renderer = null;
        this.pickupSystem = null;
        this.ui = null;
        
        // Состояние игры
        this.gameTime = 0;
        this.dt = 0;
        this.lastTime = 0;
        this.state = 'playing'; // playing, levelup, paused, dead
        this.keys = {};
        this.levelUpOptions = [];
        
        // Слоты
        this.MAX_WEAPONS = 6;
        this.MAX_PASSIVES = 6;
        
        // Биндинг методов
        this.gameLoop = this.gameLoop.bind(this);
    }

    async init() {
        try {
            console.log('🎮 Initializing game...');
            
            // Инициализируем i18n
            await this.i18n.init();
            console.log('✅ i18n initialized:', this.i18n.getLocale());
            
            // Создаем системы
            this.player = new Player();
            this.enemySystem = new EnemySystem();
            this.weaponSystem = new WeaponSystem(this.player);
            this.waveSystem = new WaveSystem();
            this.renderer = new Renderer(this.canvas, this.ctx);
            this.pickupSystem = new PickupSystem(this.player);
            
            // UI создаем последним
            this.ui = new UIManager(this);
            
            // Настраиваем ввод
            this.setupInput();
            
            // Ресайз
            this.renderer.resize();
            window.addEventListener('resize', () => this.renderer.resize());
            
            console.log('✅ Game initialized!');
            
        } catch (error) {
            console.error('❌ Init failed:', error);
            throw error;
        }
    }

    setupInput() {
        // Используем keydown для всех клавиш
        window.addEventListener('keydown', (e) => {
            // Сохраняем состояние клавиш (используем code, не зависит от раскладки)
            this.keys[e.code] = true;
            
            // Пауза
            if (e.code === 'Escape' || e.code === 'KeyP') {
                e.preventDefault();
                this.togglePause();
            }
            
            // Выбор при levelup
            if (this.state === 'levelup') {
                if (e.code === 'Digit1' || e.code === 'Numpad1') {
                    e.preventDefault();
                    this.selectLevelUpOption(0);
                } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
                    e.preventDefault();
                    this.selectLevelUpOption(1);
                } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
                    e.preventDefault();
                    this.selectLevelUpOption(2);
                } else if (e.code === 'Digit4' || e.code === 'Numpad4') {
                    e.preventDefault();
                    this.selectLevelUpOption(3);
                }
            }
            
            // Переключение языка (Ctrl+L)
            if (e.code === 'KeyL' && e.ctrlKey) {
                e.preventDefault();
                this.i18n.toggleLocale();
                this.updateLanguageButton();
                console.log('🌐 Language:', this.i18n.getLocale());
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Предотвращаем контекстное меню
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    start() {
        console.log('🚀 Starting game...');
        this.lastTime = performance.now();
        this.state = 'playing';
        this.gameTime = 0;
        
        // Скрываем меню
        this.ui.hideAll();
        
        // Запускаем цикл
        requestAnimationFrame(this.gameLoop);
    }

    gameLoop(time) {
        if (this.state === 'dead') return;
        
        this.dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;
        
        if (this.state === 'playing') {
            this.update(this.dt);
        }
        
        this.render();
        this.ui.update();
        
        requestAnimationFrame(this.gameLoop);
    }

    update(dt) {
        this.gameTime += dt;
        
        // Движение игрока (используем code для любой раскладки)
        let dx = 0, dy = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;
        
        // Нормализация
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }
        
        this.player.move(dx, dy, dt);
        
        // Обновление систем
        this.waveSystem.update(dt, this.gameTime);
        this.enemySystem.update(dt, this.player, this.waveSystem);
        this.weaponSystem.update(dt, this.enemySystem.enemies);
        this.pickupSystem.update(dt);
        
        // Проверка коллизий игрока с врагами
        this.checkPlayerCollisions(dt);
        
        // Проверка коллизий снарядов с врагами
        this.checkProjectileCollisions();
        
        // Проверка левелапа
        if (this.player.exp >= this.player.expToNext) {
            this.levelUp();
        }
        
        // Обновление неуязвимости
        if (this.player.invincible > 0) {
            this.player.invincible -= dt;
        }
    }

    checkPlayerCollisions(dt) {
        if (this.player.invincible > 0) return;
        
        for (const enemy of this.enemySystem.enemies) {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.player.radius + enemy.radius) {
                // Наносим урон игроку
                const damage = Math.max(1, enemy.damage - this.player.armor);
                this.player.hp -= damage;
                this.player.invincible = 0.5;
                this.audio.play('damage');
                
                // Отбрасывание игрока
                const knockback = 50;
                this.player.x += (dx / dist) * knockback * dt;
                this.player.y += (dy / dist) * knockback * dt;
                
                // Проверка смерти
                if (this.player.hp <= 0) {
                    this.player.hp = 0;
                    this.die();
                    return;
                }
                break;
            }
        }
    }

    checkProjectileCollisions() {
        const projectiles = this.weaponSystem.projectiles;
        const enemies = this.enemySystem.enemies;
        
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            let hit = false;
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                const dx = proj.x - enemy.x;
                const dy = proj.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < (proj.radius || 5) + enemy.radius) {
                    // Наносим урон врагу
                    enemy.hp -= proj.damage;
                    enemy.hitFlash = 0.1;
                    this.audio.play('hit');
                    
                    // Эффект при попадании
                    if (proj.onHit) {
                        proj.onHit(enemy);
                    }
                    
                    // Проверка смерти врага
                    if (enemy.hp <= 0) {
                        this.onEnemyKilled(enemy);
                        enemies.splice(j, 1);
                    }
                    
                    hit = true;
                    
                    // Если снаряд не пробивающий - выходим
                    if (!proj.piercing) {
                        break;
                    }
                }
            }
            
            // Удаляем снаряд если попал и не пробивающий
            if (hit && !proj.piercing) {
                projectiles.splice(i, 1);
            }
        }
    }

    onEnemyKilled(enemy) {
        this.player.kills++;
        this.player.exp += enemy.exp;
        this.audio.play('kill');
        
        // Шанс дропа опыта
        if (Math.random() < 0.4) {
            this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'exp');
        }
        
        // Шанс дропа золота
        if (Math.random() < 0.1) {
            this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'gold');
        }
        
        // Шанс дропа здоровья
        if (this.player.hp < this.player.maxHp * 0.5 && Math.random() < 0.05) {
            this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'health');
        }
    }

    levelUp() {
        this.state = 'levelup';
        this.player.level++;
        this.player.exp -= this.player.expToNext;
        this.player.expToNext = Math.floor(this.player.expToNext * 1.2);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 10);
        this.audio.play('levelup');
        
        // Генерируем опции
        this.levelUpOptions = this.generateLevelUpOptions();
        this.ui.showLevelUp(this.levelUpOptions);
    }

    generateLevelUpOptions() {
        const options = [];
        
        // Доступное оружие
        const currentWeaponTypes = this.weaponSystem.weapons.map(w => w.type);
        const allWeapons = ['whip', 'magic_wand', 'garlic', 'fire_wand', 'king_bible', 
                           'santa_water', 'lightning_ring', 'axe', 'cross'];
        
        // Можно добавить новое оружие если есть слоты
        if (this.weaponSystem.weapons.length < this.MAX_WEAPONS) {
            allWeapons.forEach(type => {
                if (!currentWeaponTypes.includes(type)) {
                    options.push({
                        type: 'weapon',
                        id: type,
                        name: this.i18n.t(`weapons.${type}`),
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
                    icon: weapon.icon,
                    level: weapon.level + 1
                });
            }
        });
        
        // Пассивные предметы
        const passives = ['spinach', 'armor', 'hollow_heart', 'empty_tome', 
                         'candelabrador', 'spellbinder', 'duplicator', 'attractorb'];
        
        passives.forEach(type => {
            options.push({
                type: 'passive',
                id: type,
                name: this.i18n.t(`passives.${type}`),
                icon: this.getPassiveIcon(type),
                level: 1
            });
        });
        
        // Перемешиваем и берем 4 опции
        this.shuffleArray(options);
        return options.slice(0, Math.min(4, options.length));
    }

    getPassiveIcon(type) {
        const icons = {
            spinach: '🥬',
            armor: '🛡️',
            hollow_heart: '❤️',
            empty_tome: '📖',
            candelabrador: '🕯️',
            spellbinder: '🔮',
            duplicator: '🔄',
            attractorb: '🧲'
        };
        return icons[type] || '❓';
    }

    selectLevelUpOption(index) {
        if (index < 0 || index >= this.levelUpOptions.length) return;
        
        const option = this.levelUpOptions[index];
        
        if (option.type === 'weapon') {
            this.weaponSystem.addWeapon(option.id);
        } else if (option.type === 'upgrade') {
            this.weaponSystem.upgradeWeapon(option.weaponType);
        } else if (option.type === 'passive') {
            this.addPassive(option.id);
        }
        
        this.state = 'playing';
        this.ui.hideLevelUp();
        this.lastTime = performance.now();
    }

    addPassive(type) {
        // Заглушка для пассивных предметов
        switch(type) {
            case 'spinach':
                this.player.might += 0.1;
                break;
            case 'armor':
                this.player.armor += 1;
                break;
            case 'hollow_heart':
                this.player.maxHp += Math.floor(this.player.maxHp * 0.2);
                break;
            case 'empty_tome':
                this.player.cooldown += 0.08;
                break;
            case 'candelabrador':
                this.player.area += 0.1;
                break;
            case 'spellbinder':
                this.player.duration += 0.1;
                break;
            case 'duplicator':
                this.player.amount += 1;
                break;
            case 'attractorb':
                this.player.magnet += 1;
                break;
        }
        console.log(`Added passive: ${type}`);
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.ui.showPause();
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.lastTime = performance.now();
            this.ui.hidePause();
        }
    }

    die() {
        this.state = 'dead';
        this.audio.play('death');
        this.ui.showDeath(this.player);
        
        // Сохраняем рекорд
        const record = localStorage.getItem('survivor-record') || 0;
        if (this.player.kills > record) {
            localStorage.setItem('survivor-record', this.player.kills);
        }
    }

    render() {
        this.renderer.clear();
        this.renderer.drawGrid(this.player);
        this.renderer.drawPickups(this.pickupSystem.pickups, this.player);
        this.renderer.drawEnemies(this.enemySystem.enemies, this.player);
        
        // Отрисовка снарядов
        this.weaponSystem.projectiles.forEach(p => {
            const sx = this.canvas.width / 2 + (p.x - this.player.x);
            const sy = this.canvas.height / 2 + (p.y - this.player.y);
            
            this.ctx.fillStyle = p.color || '#fff';
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, p.radius || 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
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
        
        this.renderer.drawPlayer(this.player);
        this.renderer.drawUI(this);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    updateLanguageButton() {
        const btn = document.getElementById('langButton');
        if (btn) {
            const locale = this.i18n.getLocale();
            btn.textContent = locale === 'ru' ? '🌐 EN' : '🌐 RU';
        }
    }
}