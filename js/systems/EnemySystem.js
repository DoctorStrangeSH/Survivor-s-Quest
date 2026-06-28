import { Enemy } from '../entities/Enemy.js';
import { EnemyTypes } from '../enemies/EnemyTypes.js';
import { eventBus } from '../core/EventBus.js';

export class EnemySystem {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1.5;
        this.maxEnemies = 100;
    }

    reset() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1.5;
    }

    update(dt, player) {
        // Спавн врагов
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnTimer = 0;
            this.spawnWave(player);
        }
        
        // Обновление врагов
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt, player);
            
            // Удаление мертвых врагов
            if (enemy.isDead()) {
                this.enemies.splice(i, 1);
            }
        }
    }

    spawnWave(player) {
        const waveConfig = this.getWaveConfig();
        const count = waveConfig.count;
        
        for (let i = 0; i < count; i++) {
            this.spawnEnemy(player);
        }
    }

    getWaveConfig() {
        // Получаем текущую волну из WaveSystem через eventBus
        let wave = 1;
        // Здесь можно получить wave из глобального состояния
        
        const configs = {
            1: { types: ['slime'], count: 2, boss: false },
            2: { types: ['slime', 'skeleton'], count: 3, boss: false },
            3: { types: ['slime', 'skeleton', 'bat'], count: 3, boss: false },
            4: { types: ['skeleton', 'bat'], count: 4, boss: false },
            5: { types: ['golem'], count: 1, boss: true },
        };
        
        return configs[Math.min(wave, 5)] || { types: ['skeleton', 'golem'], count: 4, boss: false };
    }

    spawnEnemy(player) {
        const waveConfig = this.getWaveConfig();
        const type = waveConfig.types[Math.floor(Math.random() * waveConfig.types.length)];
        const config = EnemyTypes[type];
        
        if (!config) return;
        
        // Спавн за экраном
        const spawnPos = this.getSpawnPosition(player);
        
        // Масштабирование с уровнем
        const enemy = new Enemy(type, spawnPos.x, spawnPos.y, {
            ...config,
            hp: config.hp + (this.getWave() - 1) * config.scaleHealth,
            speed: config.speed + (this.getWave() - 1) * config.scaleSpeed,
            gold: config.gold + Math.floor(this.getWave() / 2) * 5
        });
        
        this.enemies.push(enemy);
        
        if (config.isBoss) {
            eventBus.emit('enemy:bossSpawned', enemy);
        }
    }

    getSpawnPosition(player) {
        const canvas = document.getElementById('gameCanvas');
        const margin = 100;
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // Сверху
                x = player.x + (Math.random() - 0.5) * canvas.width;
                y = player.y - canvas.height / 2 - margin;
                break;
            case 1: // Снизу
                x = player.x + (Math.random() - 0.5) * canvas.width;
                y = player.y + canvas.height / 2 + margin;
                break;
            case 2: // Слева
                x = player.x - canvas.width / 2 - margin;
                y = player.y + (Math.random() - 0.5) * canvas.height;
                break;
            case 3: // Справа
                x = player.x + canvas.width / 2 + margin;
                y = player.y + (Math.random() - 0.5) * canvas.height;
                break;
        }
        
        return { x, y };
    }

    spawnBoss(player, type = 'boss') {
        const config = EnemyTypes[type];
        if (!config) return;
        
        const spawnPos = this.getSpawnPosition(player);
        const enemy = new Enemy(type, spawnPos.x, spawnPos.y, {
            ...config,
            hp: config.hp + this.getWave() * config.scaleHealth,
            speed: config.speed,
            gold: config.gold + this.getWave() * 20
        });
        
        this.enemies.push(enemy);
        eventBus.emit('enemy:bossSpawned', enemy);
        
        return enemy;
    }

    getEnemies() {
        return this.enemies;
    }

    getEnemyCount() {
        return this.enemies.length;
    }

    getWave() {
        // Здесь должна быть связь с WaveSystem
        return window.Game?.waveSystem?.wave || 1;
    }

    setSpawnInterval(interval) {
        this.spawnInterval = interval;
    }
}