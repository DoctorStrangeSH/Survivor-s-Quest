export class BaseWeapon {
    constructor(player, config) {
        this.player = player;
        this.type = config.type;
        this.name = config.name;
        this.icon = config.icon;
        this.level = 1;
        this.maxLevel = 8;
        this.damage = config.damage;
        this.cooldown = config.cooldown;
        this.timer = 0;
        this.range = config.range;
        this.area = config.area || 1;
        this.speed = config.speed || 1;
        this.amount = config.amount || 1;
        this.knockback = config.knockback || 0;
        this.evolution = config.evolution || null;
        this.evolutionPassive = config.evolutionPassive || null;
    }

    update(dt, enemies, projectiles, effects) {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.timer = this.cooldown / this.player.cooldown;
            this.attack(enemies, projectiles, effects);
        }
    }

    attack(enemies, projectiles, effects) {
        // Переопределяется в наследниках
    }

    levelUp() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.applyLevelUp();
        }
    }

    applyLevelUp() {
        // Переопределяется в наследниках
    }

    getDamage() {
        return this.damage * this.player.might;
    }

    getArea() {
        return this.area * this.player.area;
    }

    getSpeed() {
        return this.speed;
    }

    canEvolve() {
        return this.evolution && this.evolutionPassive && this.player.hasPassive(this.evolutionPassive);
    }
}