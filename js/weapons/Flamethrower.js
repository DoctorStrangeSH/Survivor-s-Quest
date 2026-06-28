import { Weapon } from './Weapon.js';

export class Flamethrower extends Weapon {
    constructor(player) {
        super(player, {
            name: 'weapon.flamethrower',
            icon: '🔥',
            range: 120,
            speed: 3,
            damage: 12,
            color: '#ef4444'
        });
        
        this.flameParticles = [];
        this.burnDuration = 2; // Длительность горения в секундах
        this.burnDamagePerSecond = 5;
        this.coneAngle = Math.PI / 4; // 45 градусов
        this.activeTargets = new Set();
    }

    update(dt, enemies, weaponSystem) {
        this.attackTimer += dt;
        this.cooldown = 1 / this.getSpeed();
        
        // Обновляем эффекты горения
        this.updateBurningEffects(dt, enemies);
        
        if (this.attackTimer >= this.cooldown) {
            this.attackTimer = 0;
            this.attack(enemies, weaponSystem);
        }
        
        // Обновляем частицы пламени
        this.updateFlameParticles(dt, weaponSystem);
    }

    attack(enemies, weaponSystem) {
        const facingAngle = Math.atan2(this.player.facingY, this.player.facingX);
        
        // Создаем частицы пламени
        for (let i = 0; i < 5; i++) {
            const spreadAngle = facingAngle + (Math.random() - 0.5) * this.coneAngle;
            const speed = 100 + Math.random() * 200;
            const distance = Math.random() * this.getRange();
            
            this.flameParticles.push({
                x: this.player.x + Math.cos(spreadAngle) * 20,
                y: this.player.y + Math.sin(spreadAngle) * 20,
                vx: Math.cos(spreadAngle) * speed,
                vy: Math.sin(spreadAngle) * speed,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.8,
                distance: distance,
                traveled: 0
            });
        }
        
        // Находим врагов в конусе огня
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > this.getRange()) return;
            
            const angleToEnemy = Math.atan2(dy, dx);
            let angleDiff = angleToEnemy - facingAngle;
            
            // Нормализуем угол
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            if (Math.abs(angleDiff) < this.coneAngle / 2) {
                // Наносим урон и поджигаем
                const damage = this.getDamage() * (1 - dist / this.getRange());
                enemy.takeDamage(damage * 0.016); // Урон за тик
                
                // Поджигаем врага
                if (!enemy.burning) {
                    enemy.burning = {
                        timer: this.burnDuration,
                        damagePerSecond: this.burnDamagePerSecond,
                        weaponRef: this
                    };
                    this.activeTargets.add(enemy);
                } else {
                    // Обновляем таймер горения
                    enemy.burning.timer = this.burnDuration;
                }
                
                // Эффект огня на враге
                if (Math.random() < 0.3) {
                    weaponSystem.spawnEffect({
                        x: enemy.x + (Math.random() - 0.5) * 10,
                        y: enemy.y + (Math.random() - 0.5) * 10,
                        vx: (Math.random() - 0.5) * 20,
                        vy: -20 + Math.random() * 10,
                        life: 0.2,
                        maxLife: 0.2,
                        color: '#ff6b35'
                    });
                }
            }
        });
    }

    updateBurningEffects(dt, enemies) {
        this.activeTargets.forEach(enemy => {
            if (!enemy.alive || !enemy.burning) {
                this.activeTargets.delete(enemy);
                return;
            }
            
            enemy.burning.timer -= dt;
            
            // Наносим урон от горения
            enemy.takeDamage(enemy.burning.damagePerSecond * dt);
            
            if (enemy.burning.timer <= 0) {
                delete enemy.burning;
                this.activeTargets.delete(enemy);
            }
        });
    }

    updateFlameParticles(dt, weaponSystem) {
        for (let i = this.flameParticles.length - 1; i >= 0; i--) {
            const particle = this.flameParticles[i];
            
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.life -= dt;
            particle.traveled += Math.hypot(particle.vx, particle.vy) * dt;
            
            // Затухание скорости
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            
            // Добавляем частицы в систему эффектов
            weaponSystem.spawnEffect({
                x: particle.x,
                y: particle.y,
                vx: (Math.random() - 0.5) * 30,
                vy: -10 + Math.random() * 20,
                life: 0.15,
                maxLife: 0.15,
                color: Math.random() < 0.5 ? '#ff6b35' : '#ff4444'
            });
            
            // Удаляем отработанные частицы
            if (particle.life <= 0 || particle.traveled >= particle.distance) {
                this.flameParticles.splice(i, 1);
            }
        }
    }

    upgrade() {
        super.upgrade();
        this.burnDamagePerSecond += 3;
        this.burnDuration += 0.5;
        this.coneAngle += Math.PI / 16; // +11.25 градусов
    }
}