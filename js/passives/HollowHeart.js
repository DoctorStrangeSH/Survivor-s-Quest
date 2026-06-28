import { BasePassive } from './BasePassive.js';

export class HollowHeart extends BasePassive {
    constructor(player) {
        super(player, {
            type: 'hollow_heart',
            name: 'passives.hollow_heart',
            icon: '❤️'
        });
    }

    apply() {
        const bonus = Math.floor(this.player.maxHp * 0.2);
        this.player.maxHp += bonus;
        this.player.hp += bonus;
    }
}