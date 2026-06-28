import { Ability } from './Ability.js';
import { eventBus } from '../core/EventBus.js';

export class Explosion extends Ability {
    constructor(player) {
        super(player, {
            name: 'abilities.explosion',
            icon: '💥',
            maxCooldown: 8,
            key: 'q'
        });
        
        this.baseDamage = 30;
        this.radius = 100;
        this.particleCount = 20;
    }

    execute(enemies) {
        const abilityPower = this.player.upgrades.abilityPower || 0;
        const damage = this.baseDamage + abilityPower * 10;
        
        // Наносим урон врагам в радиусе
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < this.radius) {
                enemy.takeDamage(damage);
                
                // Отбрасывание
                const force = 100;
                enemy.x += (dx / dist) * force * 0.1;
                enemy.y += (dy / dist) * force * 0.1;
            }
        });
        
        // Создаем визуальные эффекты
        this.createEffects();
        
        // Звук
        eventBus.emit('sound:play', 'explosion');
    }

    createEffects() {
        const weaponSystem = window.Game?.weaponSystem;
        if (!weaponSystem) return;
        
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (Math.PI * 2 * i) / this.particleCount;
            const distance = 30 + Math.random() * 70;
            
            weaponSystem.spawnEffect({
                x: this.player.x + Math.cos(angle) * distance,
                y: this.player.y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * 150,
                vy: Math.sin(angle) * 150,
                life: 0.6,
                maxLife: 0.6,
                color: '#ef4444'
            });
        }
    }
}