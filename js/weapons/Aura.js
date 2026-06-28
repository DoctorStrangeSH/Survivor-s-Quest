import { Weapon } from './Weapon.js';

export class Aura extends Weapon {
    constructor(player) {
        super(player, {
            name: 'weapon.aura',
            icon: '💫',
            range: 70,
            speed: 2,
            damage: 15,
            color: '#a855f7'
        });
        
        this.auraRadius = 70;
        this.rotationSpeed = 2; // Радиан в секунду
        this.currentAngle = 0;
        this.auraParticles = [];
        this.maxParticles = 12;
        this.pulsePhase = 0;
        this.pulseSpeed = 3;
        
        // Инициализируем частицы ауры
        this.initAuraParticles();
    }

    initAuraParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.auraParticles.push({
                angle: (Math.PI * 2 * i) / this.maxParticles,
                distance: this.auraRadius * (0.7 + Math.random() * 0.3),
                size: 2 + Math.random() * 3,
                speed: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    update(dt, enemies, weaponSystem) {
        this.attackTimer += dt;
        this.cooldown = 1 / this.getSpeed();
        
        // Обновляем угол вращения
        this.currentAngle += this.rotationSpeed * dt;
        this.pulsePhase += this.pulseSpeed * dt;
        
        // Обновляем частицы
        this.updateParticles(dt);
        
        // Пульсация ауры
        const pulseMultiplier = 1 + Math.sin(this.pulsePhase) * 0.2;
        this.auraRadius = this.getRange() * pulseMultiplier;
        
        if (this.attackTimer >= this.cooldown) {
            this.attackTimer = 0;
            this.attack(enemies, weaponSystem);
        }
        
        // Постоянный урон от ауры (каждый кадр)
        this.applyAuraDamage(dt, enemies, weaponSystem);
    }

    attack(enemies, weaponSystem) {
        // Пульс ауры - дополнительный урон всем врагам в радиусе
        const pulseDamage = this.getDamage() * 0.5;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < this.auraRadius) {
                enemy.takeDamage(pulseDamage);
                
                // Отбрасывание от центра
                const force = 30;
                enemy.x += (dx / dist) * force * 0.1;
                enemy.y += (dy / dist) * force * 0.1;
            }
        });
        
        // Визуальный эффект пульса
        this.createPulseEffect(weaponSystem);
    }

    applyAuraDamage(dt, enemies, weaponSystem) {
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < this.auraRadius) {
                // Урон зависит от расстояния до края ауры
                const damageMultiplier = 1 - (dist / this.auraRadius) * 0.5;
                const tickDamage = this.getDamage() * 0.3 * damageMultiplier * dt;
                
                enemy.takeDamage(tickDamage);
                
                // Создаем маленькие частицы при контакте
                if (Math.random() < 0.3) {
                    weaponSystem.spawnEffect({
                        x: enemy.x + (Math.random() - 0.5) * 10,
                        y: enemy.y + (Math.random() - 0.5) * 10,
                        vx: (Math.random() - 0.5) * 30,
                        vy: (Math.random() - 0.5) * 30,
                        life: 0.3,
                        maxLife: 0.3,
                        color: this.color
                    });
                }
            }
        });
    }

    createPulseEffect(weaponSystem) {
        // Создаем кольцо частиц при пульсации
        const particleCount = 16;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const startDist = this.auraRadius * 0.8;
            
            weaponSystem.spawnEffect({
                x: this.player.x + Math.cos(angle) * startDist,
                y: this.player.y + Math.sin(angle) * startDist,
                vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100,
                life: 0.5,
                maxLife: 0.5,
                color: this.color
            });
        }
    }

    updateParticles(dt) {
        this.auraParticles.forEach(particle => {
            particle.angle += particle.speed * dt;
            
            // Пульсация расстояния
            const pulseDistance = Math.sin(this.pulsePhase + particle.phase) * 10;
            particle.distance = this.auraRadius * (0.7 + Math.sin(particle.angle * 2) * 0.1) + pulseDistance;
        });
    }

    getAuraParticles() {
        return this.auraParticles.map(particle => ({
            x: this.player.x + Math.cos(particle.angle + this.currentAngle) * particle.distance,
            y: this.player.y + Math.sin(particle.angle + this.currentAngle) * particle.distance,
            size: particle.size,
            distance: particle.distance
        }));
    }

    upgrade() {
        super.upgrade();
        this.auraRadius += 10;
        this.maxParticles += 2;
        this.rotationSpeed += 0.5;
        
        // Добавляем новые частицы при улучшении
        const newParticles = this.maxParticles - this.auraParticles.length;
        for (let i = 0; i < newParticles; i++) {
            this.auraParticles.push({
                angle: Math.random() * Math.PI * 2,
                distance: this.auraRadius * (0.7 + Math.random() * 0.3),
                size: 2 + Math.random() * 3,
                speed: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
}