export class Ability {
    constructor(player, config) {
        this.player = player;
        this.name = config.name;
        this.icon = config.icon;
        this.cooldown = 0;
        this.maxCooldown = config.maxCooldown;
        this.ready = true;
        this.key = config.key;
    }

    update(dt) {
        if (!this.ready) {
            this.cooldown -= dt;
            if (this.cooldown <= 0) {
                this.ready = true;
                this.cooldown = 0;
            }
        }
    }

    use(enemies) {
        if (!this.ready) return;
        
        this.ready = false;
        this.cooldown = this.maxCooldown;
        
        this.execute(enemies);
    }

    execute(enemies) {
        // Переопределяется в дочерних классах
    }

    isReady() {
        return this.ready;
    }

    getCooldownPercent() {
        if (this.ready) return 1;
        return 1 - (this.cooldown / this.maxCooldown);
    }

    getRemainingCooldown() {
        return Math.ceil(this.cooldown);
    }

    reset() {
        this.cooldown = 0;
        this.ready = true;
    }
}