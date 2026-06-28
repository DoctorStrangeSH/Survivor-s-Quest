import { BaseWeapon } from './BaseWeapon.js';

export class Garlic extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'garlic',
            name: 'weapons.garlic',
            icon: '🧄',
            damage: 5,
            cooldown: 0.5,
            range: 60,
            area: 1,
            knockback: 5,
            evolution: 'soul_eater',
            evolutionPassive: 'pummarola'
        });
    }

    attack(enemies, projectiles, effects) {
        const range = this.range * this.getArea();
        const damage = this.getDamage() * 0.016; // Урон за кадр
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < range) {
                enemy.takeDamage(damage);
                
                if (this.knockback > 0) {
                    const force = this.knockback * (1 - dist / range);
                    enemy.x += (dx / dist) * force * 0.1;
                    enemy.y += (dy / dist) * force * 0.1;
                }
            }
        });
    }

    applyLevelUp() {
        if (this.level === 2) this.range += 10;
        if (this.level === 3) this.damage += 3;
        if (this.level === 4) this.range += 15;
        if (this.level === 5) this.damage += 5;
        if (this.level === 6) this.cooldown *= 0.7;
        if (this.level === 7) this.range += 20;
        if (this.level === 8) this.damage += 7;
    }
}