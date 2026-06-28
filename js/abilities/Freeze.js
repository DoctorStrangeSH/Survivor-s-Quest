import { Ability } from './Ability.js';
import { eventBus } from '../core/EventBus.js';

export class Freeze extends Ability {
    constructor(player) {
        super(player, {
            name: 'abilities.freeze',
            icon: '❄️',
            maxCooldown: 10,
            key: 'e'
        });
        
        this.radius = 130;
        this.duration = 3000; // 3 секунды в мс
        this.slowAmount = 0.3;
    }

    execute(enemies) {
        const affectedEnemies = [];
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < this.radius) {
                enemy.applyFreeze(this.duration);
                enemy.color = '#67e8f9';
                affectedEnemies.push(enemy);
                
                // Возвращаем цвет после заморозки
                setTimeout(() => {
                    if (enemy.alive) {
                        enemy.effects.frozen = false;
                        enemy.effects.speedMultiplier = 1;
                        enemy.color = EnemyTypes[enemy.type]?.color || enemy.color;
                    }
                }, this.duration);
            }
        });
        
        // Визуальный эффект
        this.createEffects();
        
        // Звук
        eventBus.emit('sound:play', 'freeze');
        
        return affectedEnemies;
    }

    createEffects() {
        const weaponSystem = window.Game?.weaponSystem;
        if (!weaponSystem) return;
        
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            
            weaponSystem.spawnEffect({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * 80,
                vy: Math.sin(angle) * 80,
                life: 0.8,
                maxLife: 0.8,
                color: '#67e8f9'
            });
        }
    }
}