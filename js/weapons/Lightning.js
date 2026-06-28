import { Weapon } from './Weapon.js';
import { Projectile } from '../entities/Projectile.js';

export class Lightning extends Weapon {
    constructor(player) {
        super(player, {
            name: 'weapon.lightning',
            icon: '⚡',
            range: 150,
            speed: 0.7,
            damage: 35,
            color: '#fbbf24'
        });
        
        this.chainTargets = 3;
        this.chainRange = 80;
        this.chainDamageFalloff = 0.7; // 70% урона на каждую следующую цель
        this.lightningSegments = [];
        this.segmentLifetime = 0.3;
    }

    update(dt, enemies, weaponSystem) {
        this.attackTimer += dt;
        this.cooldown = 1 / this.getSpeed();
        
        // Обновляем сегменты молний
        this.updateLightningSegments(dt);
        
        if (this.attackTimer >= this.cooldown) {
            this.attackTimer = 0;
            this.attack(enemies, weaponSystem);
        }
    }

    attack(enemies, weaponSystem) {
        // Находим ближайших врагов для цепочки молний
        const targets = this.findChainTargets(enemies);
        
        if (targets.length > 0) {
            let currentPos = { x: this.player.x, y: this.player.y };
            let currentDamage = this.getDamage();
            
            targets.forEach((enemy, index) => {
                // Создаем сегмент молнии
                this.createLightningSegment(
                    currentPos.x, currentPos.y,
                    enemy.x, enemy.y,
                    index === 0 ? '#ffffff' : '#fbbf24'
                );
                
                // Наносим урон
                enemy.takeDamage(currentDamage);
                
                // Визуальный эффект попадания
                this.createImpactEffect(enemy, weaponSystem);
                
                // Уменьшаем урон для следующей цепи
                currentDamage *= this.chainDamageFalloff;
                currentPos = { x: enemy.x, y: enemy.y };
            });
            
            // Создаем дополнительные визуальные эффекты
            this.createLightningEffects(targets, weaponSystem);
        }
    }

    findChainTargets(enemies) {
        const targets = [];
        let currentPos = { x: this.player.x, y: this.player.y };
        const remainingEnemies = [...enemies];
        
        for (let i = 0; i < this.chainTargets; i++) {
            let nearestEnemy = null;
            let nearestDist = i === 0 ? this.getRange() : this.chainRange;
            
            for (const enemy of remainingEnemies) {
                if (targets.includes(enemy)) continue;
                
                const dx = enemy.x - currentPos.x;
                const dy = enemy.y - currentPos.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            }
            
            if (nearestEnemy) {
                targets.push(nearestEnemy);
                currentPos = { x: nearestEnemy.x, y: nearestEnemy.y };
            } else {
                break;
            }
        }
        
        return targets;
    }

    createLightningSegment(x1, y1, x2, y2, color) {
        // Создаем zigzag линию для эффекта молнии
        const segments = [];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        const segmentsCount = Math.floor(dist / 15);
        
        segments.push({ x: x1, y: y1 });
        
        for (let i = 1; i < segmentsCount; i++) {
            const t = i / segmentsCount;
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            
            segments.push({
                x: x1 + dx * t + offsetX,
                y: y1 + dy * t + offsetY
            });
        }
        
        segments.push({ x: x2, y: y2 });
        
        this.lightningSegments.push({
            segments,
            color,
            life: this.segmentLifetime,
            maxLife: this.segmentLifetime
        });
    }

    createImpactEffect(enemy, weaponSystem) {
        // Электрические искры
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            weaponSystem.spawnEffect({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angle) * 150,
                vy: Math.sin(angle) * 150,
                life: 0.3,
                maxLife: 0.3,
                color: '#fbbf24'
            });
        }
    }

    createLightningEffects(targets, weaponSystem) {
        // Электрические частицы вокруг игрока
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 30;
            
            weaponSystem.spawnEffect({
                x: this.player.x + Math.cos(angle) * dist,
                y: this.player.y + Math.sin(angle) * dist,
                vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100,
                life: 0.4,
                maxLife: 0.4,
                color: '#fbbf24'
            });
        }
    }

    updateLightningSegments(dt) {
        for (let i = this.lightningSegments.length - 1; i >= 0; i--) {
            this.lightningSegments[i].life -= dt;
            if (this.lightningSegments[i].life <= 0) {
                this.lightningSegments.splice(i, 1);
            }
        }
    }

    getLightningSegments() {
        return this.lightningSegments;
    }

    upgrade() {
        super.upgrade();
        this.chainTargets = Math.min(6, this.chainTargets + 1);
        this.chainRange += 20;
        this.chainDamageFalloff = Math.min(0.9, this.chainDamageFalloff + 0.05);
    }
}