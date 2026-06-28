export class BasePassive {
    constructor(player, config) {
        this.player = player;
        this.type = config.type;
        this.name = config.name;
        this.icon = config.icon;
        this.level = 1;
        this.maxLevel = 5;
    }

    apply() {
        // Переопределяется в наследниках
    }

    levelUp() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.apply();
        }
    }
}