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
            
            // Удаление мертвых
            if (enemy.hp <= 0) {
                this.enemies.splice(i, 1);
                player.kills++;
                player.addExp(enemy.exp);
                
                // Дроп опыта
                if (Math.random() < 0.3) {
                    // Создать пикап опыта
                }
            }
        }
    }

    spawnEnemy(player, waveSystem) {
        const type = waveSystem.getEnemyType();
        const config = this.getEnemyConfig(type);
        
        // Спавн за экраном
        const angle = Math.random() * Math.PI * 2;
        const dist = 500 + Math.random() * 200;
        
        this.enemies.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            radius: config.radius,
            speed: config.speed + waveSystem.getWave() * 3,
            hp: config.hp + waveSystem.getWave() * 5,
            maxHp: config.hp + waveSystem.getWave() * 5,
            damage: config.damage,
            exp: config.exp,
            color: config.color,
            type: type,
            hitFlash: 0,
            effects: []
        });
    }

    getEnemyConfig(type) {
        const configs = {
            bat: {
                radius: 10,
                speed: 150,
                hp: 10,
                damage: 5,
                exp: 3,
                color: '#8b5cf6'
            },
            skeleton: {
                radius: 14,
                speed: 90,
                hp: 30,
                damage: 10,
                exp: 7,
                color: '#94a3b8'
            },
            zombie: {
                radius: 12,
                speed: 60,
                hp: 40,
                damage: 15,
                exp: 8,
                color: '#4ade80'
            },
            ghost: {
                radius: 11,
                speed: 130,
                hp: 15,
                damage: 8,
                exp: 5,
                color: '#67e8f9'
            },
            golem: {
                radius: 20,
                speed: 40,
                hp: 100,
                damage: 25,
                exp: 20,
                color: '#92400e'
            },
            boss: {
                radius: 30,
                speed: 30,
                hp: 500,
                damage: 40,
                exp: 100,
                color: '#ef4444'
            }
        };
        return configs[type] || configs.bat;
    }
}