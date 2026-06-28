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
        this.arc = Math.PI / 2; // 90 градусов - угол атаки
    }

    attack(enemies, projectiles, effects) {
        const damage = this.getDamage();
        const range = this.range * this.getArea();
        const facing = this.player.facing;
        const facingAngle = Math.atan2(facing.y, facing.x); // Определяем ОДИН раз здесь
        
        // Атакуем amount раз (при улучшении может быть 2+)
        for (let i = 0; i < this.amount; i++) {
            // Небольшое смещение угла для дополнительных атак
            const offsetAngle = i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * Math.PI / 6;
            const currentFacingAngle = facingAngle + offsetAngle;
            
            // Проверяем всех врагов
            enemies.forEach(enemy => {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Враг в радиусе атаки?
                if (dist < range) {
                    const angleToEnemy = Math.atan2(dy, dx);
                    let angleDiff = angleToEnemy - currentFacingAngle;
                    
                    // Нормализуем угол в диапазон [-PI, PI]
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    
                    // Враг в секторе атаки?
                    if (Math.abs(angleDiff) < this.arc / 2) {
                        // Наносим урон (враг - простой объект)
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
        
        // Визуальный эффект взмаха хлыста
        this.createVisualEffect(facingAngle, range, effects);
    }

    createVisualEffect(facingAngle, range, effects) {
        // Создаем частицы по дуге атаки
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            // Разброс в пределах дуги атаки
            const angle = facingAngle + (Math.random() - 0.5) * this.arc;
            const dist = Math.random() * range;
            
            effects.push({
                x: this.player.x + Math.cos(angle) * dist,
                y: this.player.y + Math.sin(angle) * dist,
                vx: Math.cos(angle) * 50,
                vy: Math.sin(angle) * 50,
                life: 0.2,
                maxLife: 0.2,
                color: '#fbbf24',
                size: 3
            });
        }
        
        // Дополнительные частицы на конце хлыста
        for (let i = 0; i < 3; i++) {
            const angle = facingAngle + (Math.random() - 0.5) * 0.3;
            const dist = range * (0.8 + Math.random() * 0.2);
            
            effects.push({
                x: this.player.x + Math.cos(angle) * dist,
                y: this.player.y + Math.sin(angle) * dist,
                vx: Math.cos(angle) * 80,
                vy: Math.sin(angle) * 80,
                life: 0.25,
                maxLife: 0.25,
                color: '#ffffff',
                size: 2
            });
        }
    }

    applyLevelUp() {
        switch(this.level) {
            case 2:
                this.damage += 5;
                break;
            case 3:
                this.arc += Math.PI / 6; // Увеличиваем угол атаки
                break;
            case 4:
                this.damage += 10;
                break;
            case 5:
                this.amount = 2; // Двойная атака
                break;
            case 6:
                this.range += 20;
                break;
            case 7:
                this.damage += 15;
                break;
            case 8:
                this.cooldown *= 0.8; // Уменьшаем перезарядку
                break;
        }
    }
}