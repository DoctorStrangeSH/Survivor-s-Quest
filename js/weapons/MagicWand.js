import { BaseWeapon } from './BaseWeapon.js';

export class MagicWand extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'magic_wand',
            name: 'weapons.magic_wand',
            icon: '🪄',
            damage: 12,
            cooldown: 0.8,
            range: 300,
            speed: 400,
            amount: 1,
            evolution: 'holy_wand',
            evolutionPassive: 'empty_tome'
        });
    }

    attack(enemies, projectiles, effects) {
        if (enemies.length === 0) return;
        
        for (let i = 0; i < this.amount; i++) {
            const target = this.findNearestEnemy(enemies);
            if (!target) return;
            
            const dx = target.x - this.player.x;
            const dy = target.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            projectiles.push({
                x: this.player.x,
                y: this.player.y,
                vx: (dx / dist) * this.speed,
                vy: (dy / dist) * this.speed,
                damage: this.getDamage(),
                life: 2,
                radius: 3,
                color: '#fbbf24',
                piercing: false
            });
        }
    }

    findNearestEnemy(enemies) {
        let nearest = null;
        let minDist = this.range;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });
        
        return nearest;
    }

    applyLevelUp() {
        if (this.level === 2) this.damage += 5;
        if (this.level === 3) this.amount = 2;
        if (this.level === 4) this.speed += 100;
        if (this.level === 5) this.damage += 10;
        if (this.level === 6) this.cooldown *= 0.8;
        if (this.level === 7) this.amount = 3;
        if (this.level === 8) this.damage += 15;
    }
}