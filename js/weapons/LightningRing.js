import { BaseWeapon } from './BaseWeapon.js';

export class LightningRing extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'lightning_ring',
            name: 'weapons.lightning_ring',
            icon: '⚡',
            damage: 15,
            cooldown: 2,
            range: 200,
            amount: 1,
            evolution: 'thunder_loop',
            evolutionPassive: 'duplicator'
        });
    }

    attack(enemies, projectiles, effects) {
        if (enemies.length === 0) return;
        
        for (let i = 0; i < this.amount; i++) {
            const target = enemies[Math.floor(Math.random() * enemies.length)];
            if (!target) continue;
            
            target.takeDamage(this.getDamage());
            
            // Визуальный эффект молнии
            effects.push({
                x: target.x, y: target.y,
                vx: 0, vy: 0,
                life: 0.1, maxLife: 0.1,
                color: '#fbbf24',
                size: 20
            });
            
            // Цепная молния (с шансом)
            if (this.level >= 4 && Math.random() < 0.5) {
                const chainTarget = this.findNearestEnemy(target, enemies);
                if (chainTarget) {
                    chainTarget.takeDamage(this.getDamage() * 0.5);
                    effects.push({
                        x: chainTarget.x, y: chainTarget.y,
                        vx: 0, vy: 0,
                        life: 0.1, maxLife: 0.1,
                        color: '#f59e0b',
                        size: 15
                    });
                }
            }
        }
    }

    findNearestEnemy(source, enemies) {
        let nearest = null;
        let minDist = 100;
        
        enemies.forEach(enemy => {
            if (enemy === source) return;
            const dx = enemy.x - source.x;
            const dy = enemy.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });
        
        return nearest;
    }

    applyLevelUp() {
        if (this.level === 2) this.damage += 10;
        if (this.level === 3) this.amount = 2;
        if (this.level === 4) this.range += 50;
        if (this.level === 5) this.damage += 15;
        if (this.level === 6) this.cooldown *= 0.7;
        if (this.level === 7) this.amount = 3;
        if (this.level === 8) this.damage += 20;
    }
}