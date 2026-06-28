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
            knockback: 5
        });
    }

    attack(enemies, projectiles, effects) {
        const range = this.range * this.getArea();
        const damagePerTick = this.getDamage() * 0.016; // Урон за кадр (~60 FPS)
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < range) {
                // Наносим постоянный урон
                enemy.hp -= damagePerTick;
                enemy.hitFlash = 0.05;
                
                // Отбрасывание (уменьшается с расстоянием)
                if (this.knockback > 0 && dist > 0) {
                    const force = this.knockback * (1 - dist / range);
                    enemy.x += (dx / dist) * force * 0.1;
                    enemy.y += (dy / dist) * force * 0.1;
                }
            }
        });
        
        // Визуальный эффект ауры (редкие частицы)
        if (Math.random() < 0.3) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * range;
            
            effects.push({
                x: this.player.x + Math.cos(angle) * dist,
                y: this.player.y + Math.sin(angle) * dist,
                vx: Math.cos(angle) * 20,
                vy: Math.sin(angle) * 20,
                life: 0.3,
                maxLife: 0.3,
                color: '#a855f7',
                size: 4
            });
        }
    }

    applyLevelUp() {
        switch(this.level) {
            case 2: this.range += 10; break;
            case 3: this.damage += 3; break;
            case 4: this.range += 15; break;
            case 5: this.damage += 5; break;
            case 6: this.cooldown *= 0.7; break;
            case 7: this.range += 20; break;
            case 8: this.damage += 7; break;
        }
    }
}