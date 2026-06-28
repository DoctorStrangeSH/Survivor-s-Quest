export class Player {
    constructor(characterConfig = null) {
        this.x = 0;
        this.y = 0;
        this.radius = 14;
        this.speed = 200;
        
        // Статы
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 20;
        this.kills = 0;
        this.gold = 0;
        
        // Модификаторы
        this.might = 1;
        this.armor = 0;
        this.area = 1;
        this.speedMul = 1;
        this.duration = 1;
        this.cooldown = 1;
        this.luck = 1;
        this.greed = 1;
        this.magnet = 0;
        this.amount = 1;
        this.expBonus = 0;
        
        // Состояния
        this.invincible = 0;
        this.invincibleDuration = 0.5;
        this.alive = true;
        this.facing = { x: 0, y: -1 };
        this.passives = [];
        
        // Визуальные настройки
        this.characterIcon = '🧛';
        this.characterType = null;
        this.bodyColor = '#c084fc';
        this.glowColor = '#a855f7';
        this.eyeColor = '#1a1a2e';
        
        // Применяем конфиг персонажа
        if (characterConfig) {
            this.applyCharacterConfig(characterConfig);
        }
        
        console.log('✅ Player created');
    }

    applyCharacterConfig(config) {
        if (config.icon) this.characterIcon = config.icon;
        if (config.characterType) this.characterType = config.characterType;
        if (config.bodyColor) this.bodyColor = config.bodyColor;
        if (config.glowColor) this.glowColor = config.glowColor;
        
        // Применяем бонусы
        if (config.bonuses) {
            this.might += config.bonuses.might || 0;
            this.armor += config.bonuses.armor || 0;
            this.speedMul += config.bonuses.speed || 0;
            this.area += config.bonuses.area || 0;
            this.duration += config.bonuses.duration || 0;
            this.cooldown += config.bonuses.cooldown || 0;
            this.luck += config.bonuses.luck || 0;
            this.greed += config.bonuses.greed || 0;
            this.magnet += config.bonuses.magnet || 0;
            this.amount += config.bonuses.amount || 0;
            if (config.bonuses.maxHp) {
                this.maxHp += config.bonuses.maxHp;
                this.hp += config.bonuses.maxHp;
            }
            if (config.bonuses.expBonus) {
                this.expBonus = config.bonuses.expBonus;
            }
        }
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 20;
        this.kills = 0;
        this.gold = 0;
        this.might = 1;
        this.armor = 0;
        this.area = 1;
        this.speedMul = 1;
        this.duration = 1;
        this.cooldown = 1;
        this.luck = 1;
        this.greed = 1;
        this.magnet = 0;
        this.amount = 1;
        this.expBonus = 0;
        this.invincible = 0;
        this.alive = true;
        this.facing = { x: 0, y: -1 };
        this.passives = [];
    }

    move(dx, dy, dt) {
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            this.facing = { x: dx / len, y: dy / len };
        }
        this.x += dx * this.speed * this.speedMul * dt;
        this.y += dy * this.speed * this.speedMul * dt;
        if (this.invincible > 0) this.invincible -= dt;
    }

    takeDamage(damage) {
        if (this.invincible > 0) return false;
        this.hp -= Math.max(1, damage - this.armor);
        this.invincible = this.invincibleDuration;
        if (this.hp <= 0) { this.hp = 0; this.alive = false; return true; }
        return false;
    }

    heal(amount) {
        const before = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        return this.hp - before;
    }

    getPassiveLevel(type) {
        const p = this.passives.find(p => p.type === type);
        return p ? p.level : 0;
    }

    addPassive(type) {
        const existing = this.passives.find(p => p.type === type);
        if (existing) existing.level++;
        else this.passives.push({ type, level: 1 });
    }

    hasPassive(type) {
        return this.passives.some(p => p.type === type);
    }

    getStats() {
        return {
            hp: this.hp, maxHp: this.maxHp, level: this.level,
            exp: this.exp, expToNext: this.expToNext,
            kills: this.kills, gold: this.gold,
            might: this.might, armor: this.armor,
            speedMul: this.speedMul, magnet: this.magnet,
            passives: [...this.passives]
        };
    }

    isAlive() { return this.alive; }
    isInvincible() { return this.invincible > 0; }
    getPosition() { return { x: this.x, y: this.y }; }
    getFacing() { return { ...this.facing }; }
}