export class ShopSystem {
    constructor() {
        this.upgrades = [];
        this.loadUpgrades();
    }

    loadUpgrades() {
        const saved = localStorage.getItem('survivor-upgrades');
        if (saved) {
            this.upgrades = JSON.parse(saved);
        } else {
            this.upgrades = [];
        }
    }

    saveUpgrades() {
        localStorage.setItem('survivor-upgrades', JSON.stringify(this.upgrades));
    }

    getUpgradeLevel(id) {
        const upgrade = this.upgrades.find(u => u.id === id);
        return upgrade ? upgrade.level : 0;
    }

    buyUpgrade(id) {
        const existing = this.upgrades.find(u => u.id === id);
        if (existing) {
            existing.level++;
        } else {
            this.upgrades.push({ id, level: 1 });
        }
        this.saveUpgrades();
    }

    getUpgradeCost(id) {
        const level = this.getUpgradeLevel(id);
        const baseCosts = {
            maxHp: 100,
            damage: 150,
            armor: 200,
            speed: 120,
            area: 180,
            cooldown: 250,
            magnet: 100,
            luck: 300,
            greed: 200,
            expBonus: 350,
            weaponSlot: 1000,
            passiveSlot: 800
        };
        
        const baseCost = baseCosts[id] || 100;
        return Math.floor(baseCost * Math.pow(1.5, level));
    }

    getUpgradeMaxLevel(id) {
        const maxLevels = {
            maxHp: 5,
            damage: 5,
            armor: 5,
            speed: 3,
            area: 5,
            cooldown: 3,
            magnet: 3,
            luck: 3,
            greed: 5,
            expBonus: 3,
            weaponSlot: 2,
            passiveSlot: 2
        };
        return maxLevels[id] || 5;
    }

    applyUpgrades(player) {
        this.upgrades.forEach(upgrade => {
            switch(upgrade.id) {
                case 'maxHp':
                    player.maxHp += 20 * upgrade.level;
                    player.hp += 20 * upgrade.level;
                    break;
                case 'damage':
                    player.might += 0.1 * upgrade.level;
                    break;
                case 'armor':
                    player.armor += 1 * upgrade.level;
                    break;
                case 'speed':
                    player.speedMul += 0.1 * upgrade.level;
                    break;
                case 'area':
                    player.area += 0.1 * upgrade.level;
                    break;
                case 'cooldown':
                    player.cooldown += 0.08 * upgrade.level;
                    break;
                case 'magnet':
                    player.magnet += 1 * upgrade.level;
                    break;
                case 'luck':
                    player.luck += 0.2 * upgrade.level;
                    break;
                case 'greed':
                    player.greed += 0.15 * upgrade.level;
                    break;
                case 'expBonus':
                    player.expBonus = (player.expBonus || 0) + 0.1 * upgrade.level;
                    break;
                case 'weaponSlot':
                    // Увеличивает MAX_WEAPONS в game
                    break;
                case 'passiveSlot':
                    // Увеличивает MAX_PASSIVES в game
                    break;
            }
        });
    }
}