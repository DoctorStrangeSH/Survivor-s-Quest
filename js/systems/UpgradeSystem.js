import { eventBus } from '../core/EventBus.js';

export class UpgradeSystem {
    constructor() {
        this.availableUpgrades = [
            {
                id: 'damage',
                name: 'upgrades.damage',
                desc: 'upgrades.damageDesc',
                icon: '⚔️',
                maxLevel: 10,
                apply: (player) => {
                    player.upgrade('damage', 1);
                }
            },
            {
                id: 'speed',
                name: 'upgrades.speed',
                desc: 'upgrades.speedDesc',
                icon: '🏃',
                maxLevel: 8,
                apply: (player) => {
                    player.increaseSpeed(0.15);
                }
            },
            {
                id: 'maxHp',
                name: 'upgrades.maxHp',
                desc: 'upgrades.maxHpDesc',
                icon: '❤️',
                maxLevel: 10,
                apply: (player) => {
                    player.addMaxHP(20);
                }
            },
            {
                id: 'attackSpeed',
                name: 'upgrades.attackSpeed',
                desc: 'upgrades.attackSpeedDesc',
                icon: '⚡',
                maxLevel: 8,
                apply: (player) => {
                    player.increaseAttackSpeed(0.2);
                }
            },
            {
                id: 'abilityPower',
                name: 'upgrades.abilityPower',
                desc: 'upgrades.abilityPowerDesc',
                icon: '💥',
                maxLevel: 5,
                apply: (player) => {
                    player.increaseAbilityPower(1);
                }
            },
            {
                id: 'armor',
                name: 'upgrades.armor',
                desc: 'upgrades.armorDesc',
                icon: '🛡️',
                maxLevel: 5,
                apply: (player) => {
                    player.increaseArmor(2);
                }
            },
            {
                id: 'projectileCount',
                name: 'upgrades.projectileCount',
                desc: 'upgrades.projectileCountDesc',
                icon: '🎯',
                maxLevel: 5,
                apply: (player) => {
                    // Специальное улучшение для оружия
                    eventBus.emit('weapon:upgrade', 'projectileCount');
                }
            }
        ];
    }

    getRandomUpgrades(count = 3) {
        const shuffled = [...this.availableUpgrades].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    applyUpgrade(upgradeId, player) {
        const upgrade = this.availableUpgrades.find(u => u.id === upgradeId);
        if (upgrade) {
            upgrade.apply(player);
            eventBus.emit('upgrade:applied', upgrade);
        }
    }
}