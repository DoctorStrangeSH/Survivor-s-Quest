import { BasePassive } from './BasePassive.js';

export class Candelabrador extends BasePassive {
    constructor(player) {
        super(player, {
            type: 'candelabrador',
            name: 'passives.candelabrador',
            icon: '🕯️'
        });
    }

    apply() {
        this.player.area += 0.1;
    }
}