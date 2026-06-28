import { BasePassive } from './BasePassive.js';

export class Armor extends BasePassive {
    constructor(player) {
        super(player, {
            type: 'armor',
            name: 'passives.armor',
            icon: '🛡️'
        });
    }

    apply() {
        this.player.armor += 1;
    }
}