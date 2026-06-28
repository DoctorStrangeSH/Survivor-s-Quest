import { BasePassive } from './BasePassive.js';

export class Spinach extends BasePassive {
    constructor(player) {
        super(player, {
            type: 'spinach',
            name: 'passives.spinach',
            icon: '🥬'
        });
    }

    apply() {
        this.player.might += 0.1;
    }
}