import { Player } from '../entities/Player.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { PickupSystem } from '../systems/PickupSystem.js';

export class CoopGame {
    constructor(game) {
        this.game = game;
        this.players = [];
        this.weaponSystems = [];
        this.sharedExp = true; // Общий опыт
        this.friendlyFire = false;
    }

    init(playerCount = 2) {
        this.players = [];
        this.weaponSystems = [];
        
        for (let i = 0; i < playerCount; i++) {
            const player = new Player(i);
            this.players.push(player);
            this.weaponSystems.push(new WeaponSystem(player));
        }
        
        this.enemySystem = new EnemySystem();
        this.waveSystem = new WaveSystem();
        this.pickupSystems = this.players.map(p => new PickupSystem(p));
    }

    update(dt, keys) {
        // Обновление игроков
        this.players.forEach((player, index) => {
            const controls = this.getPlayerControls(index, keys);
            player.move(controls.dx, controls.dy, dt);
            
            // Авто-прицеливание для каждого игрока
            this.autoAim(player);
        });
        
        // Обновление систем
        this.waveSystem.update(dt, this.game.gameTime);
        this.enemySystem.update(dt, this.players, this.waveSystem);
        
        this.weaponSystems.forEach((ws, i) => {
            ws.update(dt, this.enemySystem.enemies);
        });
        
        this.pickupSystems.forEach(ps => ps.update(dt));
        
        // Коллизии
        this.checkAllCollisions();
        
        // Общий опыт
        if (this.sharedExp) {
            this.distributeExp();
        }
    }

    getPlayerControls(index, keys) {
        if (index === 0) {
            // Игрок 1: WASD
            let dx = 0, dy = 0;
            if (keys['KeyW']) dy -= 1;
            if (keys['KeyS']) dy += 1;
            if (keys['KeyA']) dx -= 1;
            if (keys['KeyD']) dx += 1;
            return { dx, dy };
        } else {
            // Игрок 2: Стрелки
            let dx = 0, dy = 0;
            if (keys['ArrowUp']) dy -= 1;
            if (keys['ArrowDown']) dy += 1;
            if (keys['ArrowLeft']) dx -= 1;
            if (keys['ArrowRight']) dx += 1;
            return { dx, dy };
        }
    }

    autoAim(player) {
        const enemies = this.enemySystem.enemies;
        if (enemies.length === 0) return;
        
        let nearest = null;
        let minDist = Infinity;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });
        
        if (nearest) {
            const dx = nearest.x - player.x;
            const dy = nearest.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            player.facing = { x: dx / dist, y: dy / dist };
        }
    }

    checkAllCollisions() {
        this.players.forEach((player, index) => {
            if (!player.alive || player.invincible > 0) return;
            
            this.enemySystem.enemies.forEach(enemy => {
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < player.radius + enemy.radius) {
                    player.takeDamage(enemy.damage);
                }
            });
        });
    }

    distributeExp() {
        const alivePlayers = this.players.filter(p => p.alive);
        if (alivePlayers.length === 0) return;
        
        // Распределяем опыт между живыми игроками
        alivePlayers.forEach(player => {
            if (player.exp >= player.expToNext) {
                player.level++;
                player.exp -= player.expToNext;
                player.expToNext = Math.floor(player.expToNext * 1.2);
            }
        });
    }

    draw(ctx, canvas) {
        this.players.forEach(player => {
            if (!player.alive) return;
            
            const sx = canvas.width / 2 + (player.x - this.getCenterX());
            const sy = canvas.height / 2 + (player.y - this.getCenterY());
            
            // Рисуем игрока
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(sx, sy, player.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Номер игрока
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`P${player.playerIndex + 1}`, sx, sy - 18);
            
            // HP бар
            const hpPercent = player.hp / player.maxHp;
            const barWidth = 30;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(sx - barWidth/2, sy - 22, barWidth, 3);
            ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : '#ef4444';
            ctx.fillRect(sx - barWidth/2, sy - 22, barWidth * hpPercent, 3);
        });
    }

    getCenterX() {
        const alivePlayers = this.players.filter(p => p.alive);
        if (alivePlayers.length === 0) return 0;
        return alivePlayers.reduce((sum, p) => sum + p.x, 0) / alivePlayers.length;
    }

    getCenterY() {
        const alivePlayers = this.players.filter(p => p.alive);
        if (alivePlayers.length === 0) return 0;
        return alivePlayers.reduce((sum, p) => sum + p.y, 0) / alivePlayers.length;
    }
}