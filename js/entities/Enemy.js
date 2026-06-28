import { EnemyTypes } from '../enemies/EnemyTypes.js';

export class Enemy {
    constructor(type, x, y, config) {
        this.type = type;
        this.x = x;
        this.y = y;
        
        // Базовые параметры из конфига
        this.radius = config.radius;
        this.speed = config.speed;
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.damage = config.damage;
        this.exp = config.exp;
        this.gold = config.gold || 0;
        this.color = config.color;
        
        // Состояния
        this.alive = true;
        this.hitFlash = 0;
        this.hitFlashDuration = 0.15;
        
        // Эффекты
        this.effects = {
            slowed: false,
            speedMultiplier: 1,
            frozen: false
        };
        
        // Анимация
        this.animationTimer = 0;
    }

    update(dt, player) {
        if (!this.alive) return;
        
        // Движение к игроку
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 0) {
            const speed = this.speed * this.effects.speedMultiplier;
            this.x += (dx / dist) * speed * dt;
            this.y += (dy / dist) * speed * dt;
        }
        
        // Hit flash
        if (this.hitFlash > 0) {
            this.hitFlash -= dt;
        }
        
        // Обновление эффектов
        this.updateEffects(dt);
        
        // Анимация
        this.animationTimer += dt;
    }

    updateEffects(dt) {
        if (this.effects.slowed) {
            this.effects.slowedTimer -= dt;
            if (this.effects.slowedTimer <= 0) {
                this.effects.slowed = false;
                this.effects.speedMultiplier = 1;
            }
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlash = this.hitFlashDuration;
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    applySlow(multiplier, duration) {
        this.effects.slowed = true;
        this.effects.speedMultiplier = multiplier;
        this.effects.slowedTimer = duration;
    }

    applyFreeze(duration) {
        this.effects.frozen = true;
        this.effects.speedMultiplier = 0;
        this.effects.freezeTimer = duration;
    }

    isDead() {
        return !this.alive;
    }

    collidesWith(entity) {
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        const dist = Math.hypot(dx, dy);
        return dist < this.radius + entity.radius;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    getHealthPercent() {
        return this.hp / this.maxHp;
    }
}