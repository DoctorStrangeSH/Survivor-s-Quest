import { BaseWeapon } from './BaseWeapon.js';

export class Axe extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'axe',
            name: 'weapons.axe',
            icon: '🪓',
            damage: 20,
            cooldown: 1.5,
            range: 150,
            speed: 250,
            amount: 1,
            knockback: 15,
            evolution: 'death_spiral',
            evolutionPassive: 'candelabrador'
        });
    }

    attack(enemies, projectiles, effects) {
        for (let i = 0; i < this.amount; i++) {
            const angle = -Math.PI / 2 + (i - (this.amount - 1) / 2) * 0.3;
            
            projectiles.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * this.speed,
                vy: Math.sin(angle) * this.speed * 1.5,
                damage: this.getDamage(),
                life: 1,
                radius: 6,
                color: '#92400e',
                piercing: true,
                gravity: true
            });
        }
    }

    applyLevelUp() {
        if (this.level === 2) this.damage += 10;
        if (this.level === 3) this.amount = 2;
        if (this.level === 4) this.speed += 100;
        if (this.level === 5) this.damage += 15;
        if (this.level === 6) this.amount = 3;
        if (this.level === 7) this.range += 50;
        if (this.level === 8) this.damage += 20;
    }
}