import { Weapon } from './Weapon.js';
import { Projectile } from '../entities/Projectile.js';

export class Axe extends Weapon {
    constructor(player) {
        super(player, {
            name: 'weapon.axe',
            icon: '🪓',
            range: 80,
            speed: 0.8,
            damage: 40,
            color: '#f59e0b'
        });
        
        this.arcAngle = Math.PI / 3; // 60 градусов
        this.maxTargets = 3;
        this.knockbackForce = 50;
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
        // Находим врагов в радиусе атаки
        const targetsInRange = enemies.filter(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            
            // Проверяем, что враг в секторе атаки (перед игроком)
            if (dist > this.getRange()) return false;
            
            const angle = Math.atan2(dy, dx);
            const facingAngle = Math.atan2(this.player.facingY, this.player.facingX);
            let angleDiff = angle - facingAngle;
            
            // Нормализуем угол
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            return Math.abs(angleDiff) < this.arcAngle / 2;
        });
        
        // Сортируем по расстоянию и берем ближайших
        targetsInRange.sort((a, b) => {
            const distA = Math.hypot(a.x - this.player.x, a.y - this.player.y);
            const distB = Math.hypot(b.x - this.player.x, b.y - this.player.y);
            return distA - distB;
        });
        
        const targets = targetsInRange.slice(0, this.maxTargets);
        
        if (targets.length > 0) {
            // Создаем эффект взмаха топора
            for (let i = 0; i < 8; i++) {
                const angle = Math.atan2(this.player.facingY, this.player.facingX) + (Math.random() - 0.5) * this.arcAngle;
                const dist = Math.random() * this.getRange();
                
                weaponSystem.spawnEffect({
                    x: this.player.x + Math.cos(angle) * dist,
                    y: this.player.y + Math.sin(angle) * dist,
                    vx: Math.cos(angle) * 50,
                    vy: Math.sin(angle) * 50,
                    life: 0.3,
                    maxLife: 0.3,
                    color: this.color
                });
            }
            
            // Наносим урон целям
            targets.forEach((enemy, index) => {
                // Урон зависит от расстояния (больше урона ближним целям)
                const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
                const damageMultiplier = 1 + (1 - dist / this.getRange()) * 0.5;
                const damage = this.getDamage() * damageMultiplier;
                
                enemy.takeDamage(damage);
                
                // Отбрасывание
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const distNorm = Math.hypot(dx, dy) || 1;
                
                enemy.x += (dx / distNorm) * this.knockbackForce * 0.1;
                enemy.y += (dy / distNorm) * this.knockbackForce * 0.1;
                
                // Эффект попадания
                weaponSystem.spawnEffect({
                    x: enemy.x,
                    y: enemy.y,
                    vx: (Math.random() - 0.5) * 100,
                    vy: (Math.random() - 0.5) * 100,
                    life: 0.4,
                    maxLife: 0.4,
                    color: this.color
                });
            });
        }
    }

    upgrade() {
        super.upgrade();
        this.maxTargets = Math.min(6, this.maxTargets + 1);
        this.arcAngle += Math.PI / 12; // +15 градусов
        this.knockbackForce += 10;
    }
}