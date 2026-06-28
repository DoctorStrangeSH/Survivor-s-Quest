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
        
        this.i18n = new I18n();
        this.audio = new AudioManager();
        
        this.player = null;
        this.enemySystem = null;
        this.weaponSystem = null;
        this.waveSystem = null;
        this.renderer = null;
        this.pickupSystem = null;
        this.ui = null;
        
        this.gameTime = 0;
        this.dt = 0;
        this.lastTime = 0;
        this.state = 'menu';
        this.keys = {};
        this.levelUpOptions = [];
        
        this.MAX_WEAPONS = 6;
        this.MAX_PASSIVES = 6;
        
        this.gameLoop = this.gameLoop.bind(this);
    }

    async init() {
        console.log('🎮 Initializing game...');
        
        await this.i18n.init();
        console.log('✅ i18n ready:', this.i18n.getLocale());
        
        this.player = new Player();
        this.enemySystem = new EnemySystem();
        this.weaponSystem = new WeaponSystem(this.player);
        this.waveSystem = new WaveSystem();
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.pickupSystem = new PickupSystem(this.player);
        this.ui = new UIManager(this);
        
        this.setupInput();
        this.renderer.resize();
        
        window.addEventListener('resize', () => this.renderer.resize());
        
        console.log('✅ Game initialized!');
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Escape' || e.code === 'KeyP') {
                e.preventDefault();
                this.togglePause();
            }
            
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
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    start() {
        console.log('🚀 Starting game...');
        
        // Сброс
        this.player.reset();
        this.enemySystem = new EnemySystem();
        this.weaponSystem = new WeaponSystem(this.player);
        this.waveSystem = new WaveSystem();
        this.pickupSystem = new PickupSystem(this.player);
        this.gameTime = 0;
        
        this.lastTime = performance.now();
        this.state = 'playing';
        
        this.ui.hideAll();
        
        requestAnimationFrame(this.gameLoop);
    }

    gameLoop(time) {
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
        
        // Движение игрока
        let dx = 0, dy = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;
        
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
        
        // Коллизии
        this.checkPlayerCollisions();
        this.checkProjectileCollisions();
        
        // Левелап
        if (this.player.exp >= this.player.expToNext) {
            this.levelUp();
        }
        
        // Неуязвимость
        if (this.player.invincible > 0) {
            this.player.invincible -= dt;
        }
    }

    checkPlayerCollisions() {
        if (this.player.invincible > 0) return;
        
        for (const enemy of this.enemySystem.enemies) {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.player.radius + enemy.radius) {
                const damage = Math.max(1, enemy.damage - this.player.armor);
                this.player.hp -= damage;
                this.player.invincible = 0.5;
                this.audio.play('damage');
                
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
                    // Наносим урон (враг - простой объект)
                    enemy.hp -= proj.damage;
                    enemy.hitFlash = 0.1;
                    this.audio.play('hit');
                    
                    if (enemy.hp <= 0) {
                        this.onEnemyKilled(enemy);
                        enemies.splice(j, 1);
                    }
                    
                    hit = true;
                    if (!proj.piercing) break;
                }
            }
            
            if (hit && !proj.piercing) {
                projectiles.splice(i, 1);
            }
        }
    }

    onEnemyKilled(enemy) {
        this.player.kills++;
        this.player.exp += enemy.exp;
        this.audio.play('kill');
        
        if (Math.random() < 0.4) {
            this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'exp');
        }
        if (Math.random() < 0.1) {
            this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'gold');
        }
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
        
        this.levelUpOptions = this.generateLevelUpOptions();
        this.ui.showLevelUp(this.levelUpOptions);
    }

    generateLevelUpOptions() {
        const options = [];
        const currentWeaponTypes = this.weaponSystem.weapons.map(w => w.type);
        const allWeapons = ['magic_wand', 'garlic', 'fire_wand', 'king_bible', 
                           'santa_water', 'lightning_ring', 'axe', 'cross'];
        
        // Новое оружие
        if (this.weaponSystem.weapons.length < this.MAX_WEAPONS) {
            allWeapons.forEach(type => {
                if (!currentWeaponTypes.includes(type)) {
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
        
        // Улучшение оружия
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
        
        // Пассивки
        const passives = ['spinach', 'armor', 'hollow_heart', 'empty_tome', 
                         'candelabrador', 'spellbinder', 'duplicator', 'attractorb'];
        
        passives.forEach(type => {
            options.push({
                type: 'passive',
                id: type,
                name: this.i18n.t(`passives.${type}`),
                desc: this.i18n.t(`passives.${type}_desc`),
                icon: this.getPassiveIcon(type),
                level: 1
            });
        });
        
        // Перемешиваем
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        return options.slice(0, Math.min(4, options.length));
    }

    getPassiveIcon(type) {
        const icons = {
            spinach: '🥬', armor: '🛡️', hollow_heart: '❤️',
            empty_tome: '📖', candelabrador: '🕯️', spellbinder: '🔮',
            duplicator: '🔄', attractorb: '🧲'
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
        switch(type) {
            case 'spinach': this.player.might += 0.1; break;
            case 'armor': this.player.armor += 1; break;
            case 'hollow_heart': 
                const bonus = Math.floor(this.player.maxHp * 0.2);
                this.player.maxHp += bonus;
                this.player.hp += bonus;
                break;
            case 'empty_tome': this.player.cooldown += 0.08; break;
            case 'candelabrador': this.player.area += 0.1; break;
            case 'spellbinder': this.player.duration += 0.1; break;
            case 'duplicator': this.player.amount += 1; break;
            case 'attractorb': this.player.magnet += 1; break;
        }
        console.log(`✅ Added passive: ${type}`);
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
        
        // Снаряды
        this.weaponSystem.projectiles.forEach(p => {
            const sx = this.canvas.width / 2 + (p.x - this.player.x);
            const sy = this.canvas.height / 2 + (p.y - this.player.y);
            
            this.ctx.fillStyle = p.color || '#fff';
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, p.radius || 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Эффекты
        this.weaponSystem.effects.forEach(e => {
            const sx = this.canvas.width / 2 + (e.x - this.player.x);
            const sy = this.canvas.height / 2 + (e.y - this.player.y);
            this.ctx.fillStyle = e.color;
            this.ctx.globalAlpha = e.life / e.maxLife;
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, e.size || 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        
        // Лужи Santa Water
        this.weaponSystem.weapons.forEach(weapon => {
            if (weapon.getPuddles) {
                weapon.getPuddles().forEach(puddle => {
                    const sx = this.canvas.width / 2 + (puddle.x - this.player.x);
                    const sy = this.canvas.height / 2 + (puddle.y - this.player.y);
                    
                    this.ctx.fillStyle = `rgba(59, 130, 246, 0.3)`;
                    this.ctx.beginPath();
                    this.ctx.arc(sx, sy, puddle.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }
        });
        
        this.renderer.drawPlayer(this.player);
        
        // HUD
        this.drawHUD();
    }

    drawHUD() {
        const ctx = this.ctx;
        
        // Верхняя панель
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, 35);
        
        ctx.fillStyle = '#fff';
        ctx.font = '13px Inter, sans-serif';
        ctx.textAlign = 'left';
        
        const hpPercent = (this.player.hp / this.player.maxHp * 100).toFixed(0);
        ctx.fillText(`❤️ ${Math.ceil(this.player.hp)}/${this.player.maxHp}`, 15, 24);
        ctx.fillText(`⭐ LV${this.player.level}`, 220, 24);
        ctx.fillText(`💎 ${this.player.exp}/${this.player.expToNext}`, 340, 24);
        ctx.fillText(`🌊 Волна ${this.waveSystem.getWave()}`, 500, 24);
        
        const mins = Math.floor(this.gameTime / 60);
        const secs = Math.floor(this.gameTime % 60);
        ctx.fillText(`⏱ ${mins}:${secs.toString().padStart(2, '0')}`, 650, 24);
        ctx.fillText(`💀 ${this.player.kills}`, 780, 24);
        
        // Оружие снизу
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        
        this.weaponSystem.weapons.forEach((weapon, i) => {
            const x = 30 + i * 70;
            const y = this.canvas.height - 25;
            ctx.fillText(`${weapon.icon}`, x, y - 5);
            ctx.fillText(`LV${weapon.level}`, x, y + 15);
        });
    }
}