import { BaseWeapon } from './BaseWeapon.js';

export class FireWand extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'fire_wand',
            name: 'weapons.fire_wand',
            icon: '🔥',
            damage: 20,
            cooldown: 1.5,
            range: 250,
            speed: 300,
            amount: 1,
            evolution: 'hellfire',
            evolutionPassive: 'spinach'
        });
    }

    attack(enemies, projectiles, effects) {
        if (enemies.length === 0) return;
        
        const target = this.findRandomEnemy(enemies);
        if (!target) return;
        
        for (let i = 0; i < this.amount; i++) {
            const dx = target.x - this.player.x;
            const dy = target.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            projectiles.push({
                x: this.player.x,
                y: this.player.y,
                vx: (dx / dist) * this.speed,
                vy: (dy / dist) * this.speed,
                damage: this.getDamage(),
                life: 1.5,
                radius: 5,
                color: '#ef4444',
                piercing: false,
                onHit(enemy) {
                    // Взрыв при попадании
                    effects.push({
                        x: enemy.x, y: enemy.y,
                        vx: 0, vy: 0,
                        life: 0.2, maxLife: 0.2,
                        color: '#ff6b35',
                        size: 15
                    });
                }
            });
        }
    }

    findRandomEnemy(enemies) {
        if (enemies.length === 0) return null;
        return enemies[Math.floor(Math.random() * enemies.length)];
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