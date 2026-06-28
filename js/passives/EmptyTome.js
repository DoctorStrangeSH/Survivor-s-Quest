import { BasePassive } from './BasePassive.js';

export class EmptyTome extends BasePassive {
    constructor(player) {
        super(player, {
            type: 'empty_tome',
            name: 'passives.empty_tome',
            icon: '📖'
        });
    }

    apply() {
        this.player.cooldown += 0.08;
    }
}