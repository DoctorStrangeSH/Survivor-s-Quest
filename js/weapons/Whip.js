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
            knockback: 10
        });
        this.arc = Math.PI / 2; // 90 градусов
    }

    attack(enemies, projectiles, effects) {
        const damage = this.getDamage();
        const range = this.range * this.getArea();
        const facing = this.player.facing;
        
        for (let i = 0; i < this.amount; i++) {
            const offsetAngle = i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * Math.PI / 6;
            const facingAngle = Math.atan2(facing.y, facing.x) + offsetAngle;
            
            enemies.forEach(enemy => {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < range) {
                    const angle = Math.atan2(dy, dx);
                    let diff = angle - facingAngle;
                    
                    // Нормализация угла
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    
                    if (Math.abs(diff) < this.arc / 2) {
                        // Враг - простой объект, вычитаем hp напрямую
                        enemy.hp -= damage;
                        enemy.hitFlash = 0.1;
                        
                        // Отбрасывание
                        if (this.knockback > 0 && dist > 0) {
                            enemy.x += (dx / dist) * this.knockback;
                            enemy.y += (dy / dist) * this.knockback;
                        }
                    }
                }
            });
        }
        
        // Визуальный эффект взмаха
        for (let i = 0; i < 5; i++) {
            const a = facingAngle + (Math.random() - 0.5) * this.arc;
            const d = Math.random() * range;
            effects.push({
                x: this.player.x + Math.cos(a) * d,
                y: this.player.y + Math.sin(a) * d,
                vx: 0, vy: 0,
                life: 0.15, maxLife: 0.15,
                color: '#fbbf24',
                size: 3
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