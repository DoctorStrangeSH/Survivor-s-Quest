import { Ability } from './Ability.js';
import { eventBus } from '../core/EventBus.js';

export class Heal extends Ability {
    constructor(player) {
        super(player, {
            name: 'abilities.heal',
            icon: '💚',
            maxCooldown: 12,
            key: 'r'
        });
        
        this.baseHeal = 30;
    }

    execute(enemies) {
        const abilityPower = this.player.upgrades.abilityPower || 0;
        const healAmount = this.baseHeal + abilityPower * 15;
        
        // Исцеление
        this.player.heal(healAmount);
        
        // Визуальный эффект
        this.createEffects();
        
        // Звук
        eventBus.emit('sound:play', 'heal');
    }

    createEffects() {
        const weaponSystem = window.Game?.weaponSystem;
        if (!weaponSystem) return;
        
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 10 + Math.random() * 30;
            
            weaponSystem.spawnEffect({
                x: this.player.x + Math.cos(angle) * distance,
                y: this.player.y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * 40,
                vy: Math.sin(angle) * 40,
                life: 0.5,
                maxLife: 0.5,
                color: '#4ade80'
            });
        }
    }
}