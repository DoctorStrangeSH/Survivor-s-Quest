export class Projectile {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.damage = config.damage || 20;
        this.color = config.color || '#ffffff';
        this.life = config.life || 2;
        this.maxLife = this.life;
        this.radius = config.radius || 4;
        this.piercing = config.piercing || false;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }

    isExpired() {
        return this.life <= 0;
    }

    collidesWith(entity) {
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        const dist = Math.hypot(dx, dy);
        return dist < this.radius + entity.radius;
    }

    onHit(enemy) {
        // Эффект при попадании (можно переопределить)
    }
}