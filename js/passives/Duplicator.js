import { BasePassive } from './BasePassive.js';

export class Duplicator extends BasePassive {
    constructor(player) {
        super(player, {
            type: 'duplicator',
            name: 'passives.duplicator',
            icon: '🔄'
        });
    }

    apply() {
        // Увеличивает количество снарядов у всего оружия
        this.player.amount += 0.5;
    }
}