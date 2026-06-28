// Базовый класс для всех оружий
export class Weapon {
    constructor(player, config) {
        this.player = player;
        this.name = config.name;
        this.icon = config.icon;
        this.range = config.range;
        this.baseSpeed = config.speed;
        this.baseDamage = config.damage;
        this.color = config.color;
        this.level = 1;
        
        this.attackTimer = 0;
        this.cooldown = 1 / this.baseSpeed;
    }

    getDamage() {
        return this.baseDamage + this.player.damage * 0.5;
    }

    getSpeed() {
        return this.baseSpeed * this.player.attackSpeed;
    }

    getRange() {
        return this.range;
    }

    update(dt, enemies, weaponSystem) {
        // Переопределяется в дочерних классах
    }

    attack(enemies, weaponSystem) {
        // Переопределяется в дочерних классах
    }

    upgrade() {
        this.level++;
        this.baseDamage *= 1.2;
        this.baseSpeed *= 1.1;
    }
}