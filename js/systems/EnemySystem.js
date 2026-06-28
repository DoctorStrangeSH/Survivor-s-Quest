import { EnemyTypes } from '../enemies/EnemyTypes.js';

export class EnemySystem {
    constructor() {
        this._enemies = [];
        this.spawnTimer = 0;
    }

    // Геттер для доступа к врагам
    get enemies() {
        return this._enemies;
    }

    update(dt, player, waveSystem) {
        this.spawnTimer -= dt;
        
        if (this.spawnTimer <= 0) {
            this.spawnTimer = waveSystem.getSpawnInterval();
            const count = 1 + Math.floor(waveSystem.getWave() / 3);
            for (let i = 0; i < count; i++) {
                this.spawnEnemy(player, waveSystem);
            }
        }
        
        for (let i = this._enemies.length - 1; i >= 0; i--) {
            const enemy = this._enemies[i];
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * enemy.speed * dt;
                enemy.y += (dy / dist) * enemy.speed * dt;
            }
            
            if (enemy.hitFlash > 0) enemy.hitFlash -= dt;
            
            // Удаление мертвых или слишком далеких
            if (enemy.hp <= 0 || dist > 1200) {
                this._enemies.splice(i, 1);
            }
        }
    }

    spawnEnemy(player, waveSystem) {
        const type = waveSystem.getEnemyType();
        const config = EnemyTypes[type];
        if (!config) return;
        
        const wave = waveSystem.getWave();
        const angle = Math.random() * Math.PI * 2;
        const dist = 400 + Math.random() * 200;
        
        const enemyIcons = {
            bat: '🦇', skeleton: '💀', zombie: '🧟', ghost: '👻',
            golem: '🗿', werewolf: '🐺', medusa: '🐍', vampire: '🧛',
            boss: '👹', death: '☠️'
        };
        
        this._enemies.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            radius: config.radius,
            speed: config.speed + wave * 3,
            hp: config.hp + wave * 8,
            maxHp: config.hp + wave * 8,
            damage: config.damage + Math.floor(wave / 3),
            exp: config.exp + wave * 2,
            color: config.color,
            type: type,
            icon: enemyIcons[type] || '👾',
            hitFlash: 0
        });
    }

    reset() {
        this._enemies = [];
        this.spawnTimer = 0;
    }

    getEnemyCount() {
        return this._enemies.length;
    }
}