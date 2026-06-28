import { EnemyTypes } from '../enemies/EnemyTypes.js';

export class EnemySystem {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
    }

    update(dt, player, waveSystem) {
        this.spawnTimer -= dt;
        
        if (this.spawnTimer <= 0) {
            this.spawnEnemy(player, waveSystem);
            this.spawnTimer = waveSystem.getSpawnInterval();
            
            // Спавним больше врагов на высоких волнах
            if (waveSystem.getWave() >= 5 && Math.random() < 0.3) {
                this.spawnEnemy(player, waveSystem);
            }
            if (waveSystem.getWave() >= 10 && Math.random() < 0.5) {
                this.spawnEnemy(player, waveSystem);
            }
        }
        
        // Обновление врагов
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Движение к игроку
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * enemy.speed * dt;
                enemy.y += (dy / dist) * enemy.speed * dt;
            }
            
            // Обновление hitFlash
            if (enemy.hitFlash > 0) {
                enemy.hitFlash -= dt;
            }
        }
    }

    spawnEnemy(player, waveSystem) {
        const type = waveSystem.getEnemyType();
        const config = EnemyTypes[type];
        
        if (!config) return;
        
        // Спавн за экраном
        const angle = Math.random() * Math.PI * 2;
        const dist = 500 + Math.random() * 200;
        
        const wave = waveSystem.getWave();
        
        // Создаем врага как простой объект
        const enemy = {
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            radius: config.radius,
            speed: config.speed + wave * 3,
            hp: config.hp + wave * 5,
            maxHp: config.hp + wave * 5,
            damage: config.damage + Math.floor(wave / 2),
            exp: config.exp + wave,
            color: config.color,
            type: type,
            hitFlash: 0,
            effects: {}
        };
        
        this.enemies.push(enemy);
    }

    // Проверка коллизии врага со снарядом
    static checkCollision(enemy, projectile) {
        const dx = enemy.x - projectile.x;
        const dy = enemy.y - projectile.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < enemy.radius + (projectile.radius || 5);
    }
}