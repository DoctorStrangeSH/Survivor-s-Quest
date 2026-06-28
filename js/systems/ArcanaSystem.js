export class ArcanaSystem {
    constructor() {
        this.arcanas = this.createArcanaList();
        this.activeArcana = null;
    }

    createArcanaList() {
        return [
            {
                id: 'rage',
                name: 'Ярость',
                icon: '😡',
                desc: '+50% урона когда HP < 30%',
                apply(player) {
                    if (player.hp < player.maxHp * 0.3) {
                        player.might += 0.5;
                    }
                }
            },
            {
                id: 'greed',
                name: 'Жадность',
                icon: '💎',
                desc: '+100% золота, -20% опыта',
                apply(player) {
                    player.greed += 1;
                    player.expBonus = (player.expBonus || 0) - 0.2;
                }
            },
            {
                id: 'speed_demon',
                name: 'Демон скорости',
                icon: '⚡',
                desc: '+30% скорости, -10% HP',
                apply(player) {
                    player.speedMul += 0.3;
                    player.maxHp = Math.floor(player.maxHp * 0.9);
                    player.hp = Math.min(player.hp, player.maxHp);
                }
            },
            {
                id: 'shield',
                name: 'Щит',
                icon: '🛡️',
                desc: '+3 брони, -20% урона',
                apply(player) {
                    player.armor += 3;
                    player.might -= 0.2;
                }
            },
            {
                id: 'magnetron',
                name: 'Магнетрон',
                icon: '🧲',
                desc: 'Удвоенный радиус подбора',
                apply(player) {
                    player.magnet *= 2;
                }
            },
            {
                id: 'crit_master',
                name: 'Мастер крита',
                icon: '🎯',
                desc: '10% шанс двойного урона',
                apply(player) {
                    player.critChance = (player.critChance || 0) + 0.1;
                }
            }
        ];
    }

    selectArcana(id) {
        const arcana = this.arcanas.find(a => a.id === id);
        if (arcana) {
            this.activeArcana = arcana;
            console.log(`🃏 Arcana selected: ${arcana.name}`);
        }
    }

    getRandomArcana(count = 3) {
        const shuffled = [...this.arcanas].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
}