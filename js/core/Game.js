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
        
        this.player = new Player();
        this.enemySystem = new EnemySystem();
        this.weaponSystem = new WeaponSystem(this.player);
        this.waveSystem = new WaveSystem();
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.pickupSystem = new PickupSystem(this.player);
        this.audio = new AudioManager();
        this.i18n = new I18n();
        
        this.gameTime = 0;
        this.dt = 0;
        this.lastTime = 0;
        this.state = 'playing'; // playing, levelup, paused, dead
        this.keys = {};
        
        this.MAX_WEAPONS = 6;
        this.MAX_PASSIVES = 6;
    }

    async init() {
        await this.i18n.init();
        this.renderer.resize();
        this.setupInput();
        this.setupUI();
        window.addEventListener('resize', () => this.renderer.resize());
    }

    setupInput() {
        // Обработка клавиш (работает с любой раскладкой)
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Escape' || e.code === 'KeyP') {
                this.togglePause();
            }
            
            if (this.state === 'levelup') {
                if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') {
                    const index = parseInt(e.key) - 1;
                    this.selectLevelUpOption(index);
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setupUI() {
        this.ui = new UIManager(this);
    }

    start() {
        this.lastTime = performance.now();
        this.state = 'playing';
        this.gameLoop(this.lastTime);
    }

    gameLoop(time) {
        this.dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;
        
        if (this.state === 'playing') {
            this.update(this.dt);
        }
        
        this.render();
        this.ui.update();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
        this.gameTime += dt;
        
        // Движение игрока (WASD + стрелки)
        let dx = 0, dy = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;
        
        this.player.move(dx, dy, dt);
        
        // Системы
        this.waveSystem.update(dt, this.gameTime);
        this.enemySystem.update(dt, this.player, this.waveSystem);
        this.weaponSystem.update(dt, this.enemySystem.enemies);
        this.pickupSystem.update(dt);
        
        // Коллизии игрока с врагами
        this.checkPlayerCollisions();
    }

    checkPlayerCollisions() {
        if (this.player.invincible > 0) return;
        
        for (const enemy of this.enemySystem.enemies) {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.player.radius + enemy.radius) {
                this.player.takeDamage(enemy.damage);
                this.player.invincible = 0.5;
                
                if (this.player.hp <= 0) {
                    this.die();
                }
                break;
            }
        }
    }

    levelUp() {
        this.state = 'levelup';
        this.player.level++;
        this.player.exp -= this.player.expToNext;
        this.player.expToNext = Math.floor(this.player.expToNext * 1.2);
        
        // Генерируем опции для выбора
        this.levelUpOptions = this.generateLevelUpOptions();
        this.ui.showLevelUp(this.levelUpOptions);
    }

    generateLevelUpOptions() {
        const options = [];
        const availableWeapons = this.weaponSystem.getAvailableWeapons();
        const availablePassives = this.getAvailablePassives();
        
        // Перемешиваем и берем 3-4 опции
        const allOptions = [...availableWeapons, ...availablePassives];
        
        // Перемешивание Фишера-Йетса
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }
        
        return allOptions.slice(0, Math.min(4, allOptions.length));
    }

    getAvailablePassives() {
        // Здесь будет список доступных пассивных предметов
        return [];
    }

    selectLevelUpOption(index) {
        if (index >= 0 && index < this.levelUpOptions.length) {
            const option = this.levelUpOptions[index];
            
            if (option.type === 'weapon') {
                this.weaponSystem.addWeapon(option.id);
            } else if (option.type === 'passive') {
                // Добавление пассивного предмета
            }
            
            this.state = 'playing';
            this.ui.hideLevelUp();
        }
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
        this.ui.showDeath(this.player);
    }

    render() {
        this.renderer.clear();
        this.renderer.drawGrid(this.player);
        this.renderer.drawPickups(this.pickupSystem.pickups, this.player);
        this.renderer.drawEnemies(this.enemySystem.enemies, this.player);
        this.renderer.drawWeaponEffects(this.weaponSystem, this.player);
        this.renderer.drawPlayer(this.player);
        this.renderer.drawUI(this, this.player);
    }
}