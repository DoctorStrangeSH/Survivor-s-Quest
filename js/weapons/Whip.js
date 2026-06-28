import { BaseWeapon } from './BaseWeapon.js';

export class Whip extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'whip',
            name: 'weapons.whip',
            icon: '🪢',
            damage: 15,
            cooldown: 1.2,
            range: 80,
            area: 1,
            amount: 1,
            knockback: 10,
            evolution: 'bloody_tear',
            evolutionPassive: 'hollow_heart'
        });
        this.arc = Math.PI / 2;
    }

    attack(enemies, projectiles, effects) {
        const facing = this.player.facing;
        const damage = this.getDamage();
        const range = this.range * this.getArea();
        
        for (let i = 0; i < this.amount; i++) {
            const offsetAngle = i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * Math.PI / 6;
            
            enemies.forEach(enemy => {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < range) {
                    const angle = Math.atan2(dy, dx);
                    const facingAngle = Math.atan2(facing.y, facing.x) + offsetAngle;
                    let diff = angle - facingAngle;
                    
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    
                    if (Math.abs(diff) < this.arc / 2) {
                        enemy.takeDamage(damage);
                        
                        if (this.knockback > 0) {
                            enemy.x += Math.cos(angle) * this.knockback;
                            enemy.y += Math.sin(angle) * this.knockback;
                        }
                    }
                }
            });
        }
    }

    applyLevelUp() {
        if (this.level === 2) this.damage += 5;
        if (this.level === 3) this.arc += Math.PI / 6;
        if (this.level === 4) this.damage += 10;
        if (this.level === 5) this.amount = 2;
        if (this.level === 6) this.range += 20;
        if (this.level === 7) this.damage += 15;
        if (this.level === 8) this.cooldown *= 0.8;
    }
}