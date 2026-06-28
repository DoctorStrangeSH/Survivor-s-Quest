export class Enemy {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.radius = config.radius;
        this.speed = config.speed;
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.damage = config.damage;
        this.exp = config.exp;
        this.color = config.color;
        this.type = config.type || 'bat';
        this.hitFlash = 0;
        this.effects = {};
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlash = 0.1;
    }

    isDead() {
        return this.hp <= 0;
    }
}