import { BaseWeapon } from './BaseWeapon.js';

export class SantaWater extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'santa_water',
            name: 'weapons.santa_water',
            icon: '💧',
            damage: 10,
            cooldown: 2,
            range: 150,
            area: 1,
            amount: 1,
            duration: 3,
            evolution: 'la_borra',
            evolutionPassive: 'attractorb'
        });
        this.puddles = [];
    }

    attack(enemies, projectiles, effects) {
        for (let i = 0; i < this.amount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * this.range;
            
            const x = this.player.x + Math.cos(angle) * dist;
            const y = this.player.y + Math.sin(angle) * dist;
            
            this.puddles.push({
                x, y,
                life: this.duration * this.player.duration,
                radius: 30 * this.getArea(),
                damage: this.getDamage()
            });
        }
    }

    update(dt, enemies, projectiles, effects) {
        super.update(dt, enemies, projectiles, effects);
        
        // Обновляем лужи
        for (let i = this.puddles.length - 1; i >= 0; i--) {
            const puddle = this.puddles[i];
            puddle.life -= dt;
            
            if (puddle.life <= 0) {
                this.puddles.splice(i, 1);
                continue;
            }
            
            // Наносим урон врагам в луже
            enemies.forEach(enemy => {
                const dx = enemy.x - puddle.x;
                const dy = enemy.y - puddle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < puddle.radius) {
                    enemy.takeDamage(puddle.damage * 0.2 * dt);
                }
            });
        }
    }

    getPuddles() {
        return this.puddles;
    }

    applyLevelUp() {
        if (this.level === 2) this.damage += 5;
        if (this.level === 3) this.amount = 2;
        if (this.level === 4) this.duration += 1;
        if (this.level === 5) this.damage += 10;
        if (this.level === 6) this.area += 0.5;
        if (this.level === 7) this.amount = 3;
        if (this.level === 8) this.duration += 2;
    }
}