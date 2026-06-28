import { BasePassive } from './BasePassive.js';

export class Spellbinder extends BasePassive {
    constructor(player) {
        super(player, {
            type: 'spellbinder',
            name: 'passives.spellbinder',
            icon: '🔮'
        });
    }

    apply() {
        this.player.duration += 0.1;
    }
}