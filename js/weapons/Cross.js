import { BaseWeapon } from './BaseWeapon.js';

export class Cross extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'cross',
            name: 'weapons.cross',
            icon: '✝️',
            damage: 15,
            cooldown: 2,
            range: 200,
            speed: 200,
            amount: 1,
            evolution: 'heaven_sword',
            evolutionPassive: 'clover'
        });
    }

    attack(enemies, projectiles, effects) {
        const facing = this.player.facing;
        
        for (let i = 0; i < this.amount; i++) {
            const angle = Math.atan2(facing.y, facing.x) + (i - (this.amount - 1) / 2) * 0.3;
            
            projectiles.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * this.speed,
                vy: Math.sin(angle) * this.speed,
                damage: this.getDamage(),
                life: 1.5,
                radius: 5,
                color: '#a855f7',
                piercing: true,
                boomerang: true,
                startX: this.player.x,
                startY: this.player.y,
                maxDist: this.range
            });
        }
    }

    applyLevelUp() {
        if (this.level === 2) this.damage += 5;
        if (this.level === 3) this.amount = 2;
        if (this.level === 4) this.speed += 50;
        if (this.level === 5) this.damage += 10;
        if (this.level === 6) this.range += 50;
        if (this.level === 7) this.amount = 3;
        if (this.level === 8) this.damage += 15;
    }
}