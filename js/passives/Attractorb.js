import { BasePassive } from './BasePassive.js';

export class Attractorb extends BasePassive {
    constructor(player) {
        super(player, {
            type: 'attractorb',
            name: 'passives.attractorb',
            icon: '🧲'
        });
    }

    apply() {
        this.player.magnet += 1;
    }
}