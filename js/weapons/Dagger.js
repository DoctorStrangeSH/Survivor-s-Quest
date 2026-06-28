import { Weapon } from './Weapon.js';
import { Projectile } from '../entities/Projectile.js';

export class Dagger extends Weapon {
    constructor(player) {
        super(player, {
            name: 'weapon.dagger',
            icon: '🔪',
            range: 100,
            speed: 1.2,
            damage: 25,
            color: '#ffffff'
        });
    }

    update(dt, enemies, weaponSystem) {
        this.attackTimer += dt;
        this.cooldown = 1 / this.getSpeed();
        
        if (this.attackTimer >= this.cooldown) {
            this.attackTimer = 0;
            this.attack(enemies, weaponSystem);
        }
    }

    attack(enemies, weaponSystem) {
        // Находим ближайшего врага
        let nearest = null;
        let minDist = this.getRange();
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });
        
        if (nearest) {
            // Создаем снаряд-кинжал
            const dx = nearest.x - this.player.x;
            const dy = nearest.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            
            const projectile = new Projectile({
                x: this.player.x,
                y: this.player.y,
                vx: (dx / dist) * 300,
                vy: (dy / dist) * 300,
                damage: this.getDamage(),
                color: this.color,
                life: 2
            });
            
            weaponSystem.spawnProjectile(projectile);
        }
    }
}