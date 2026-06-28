export class BaseWeapon {
    constructor(player, config) {
        this.player = player;
        this.type = config.type;
        this.name = config.name;
        this.icon = config.icon;
        this.level = 1;
        this.maxLevel = config.maxLevel || 8;
        this.damage = config.damage || 10;
        this.cooldown = config.cooldown || 1;
        this.timer = 0;
        this.range = config.range || 100;
        this.area = config.area || 1;
        this.speed = config.speed || 1;
        this.amount = config.amount || 1;
        this.knockback = config.knockback || 0;
        this.duration = config.duration || 1;
    }

    update(dt, enemies, projectiles, effects) {
        this.timer -= dt * this.player.cooldown;
        if (this.timer <= 0) {
            this.timer = this.cooldown;
            this.attack(enemies, projectiles, effects);
        }
    }

    attack(enemies, projectiles, effects) {}

    getAttackCount() {
        return Math.floor(this.amount + this.player.amount - 1);
    }

    levelUp() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.applyLevelUp();
        }
    }

    applyLevelUp() {}

    getDamage() { return this.damage * this.player.might; }
    getArea() { return this.area * this.player.area; }
}