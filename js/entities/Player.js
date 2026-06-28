export class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 14;
        this.speed = 200;
        
        // Базовые статы
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 20;
        this.kills = 0;
        this.gold = 0;
        
        // Модификаторы от пассивных предметов
        this.might = 1;        // Множитель урона (Spinach)
        this.armor = 0;        // Броня (Armor)
        this.area = 1;         // Размер области (Candelabrador)
        this.speedMul = 1;     // Множитель скорости (Wings)
        this.duration = 1;     // Длительность эффектов (Spellbinder)
        this.cooldown = 1;     // Множитель перезарядки (Empty Tome)
        this.luck = 1;         // Удача (Clover)
        this.greed = 1;        // Множитель золота (Stone Mask)
        this.magnet = 0;       // Радиус подбора (Attractorb)
        this.amount = 1;       // Дополнительные снаряды (Duplicator)
        
        // Состояния
        this.invincible = 0;
        this.invincibleDuration = 0.5;
        this.alive = true;
        
        // Направление взгляда
        this.facing = { x: 0, y: -1 };
        
        // Пассивные предметы (для отслеживания)
        this.passives = [];
        
        console.log('✅ Player created');
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
        
        this.invincible = 0;
        this.alive = true;
        this.facing = { x: 0, y: -1 };
        this.passives = [];
        
        console.log('🔄 Player reset');
    }

    move(dx, dy, dt) {
        // Обновляем направление только если есть движение
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            this.facing = { 
                x: dx / len, 
                y: dy / len 
            };
        }
        
        // Движение с учетом модификатора скорости
        const speed = this.speed * this.speedMul;
        this.x += dx * speed * dt;
        this.y += dy * speed * dt;
        
        // Обновление неуязвимости
        if (this.invincible > 0) {
            this.invincible -= dt;
        }
    }

    takeDamage(damage) {
        // Если неуязвим - урон не проходит
        if (this.invincible > 0) return false;
        
        // Уменьшаем урон броней
        const reducedDamage = Math.max(1, damage - this.armor);
        this.hp -= reducedDamage;
        
        // Активируем неуязвимость
        this.invincible = this.invincibleDuration;
        
        // Проверка смерти
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            return true; // Умер
        }
        
        return false; // Жив
    }

    heal(amount) {
        const beforeHeal = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        return this.hp - beforeHeal; // Возвращаем сколько реально вылечили
    }

    addExp(amount) {
        this.exp += amount;
        return this.exp >= this.expToNext; // Возвращает true если уровень повышен
    }

    addGold(amount) {
        const bonusGold = Math.floor(amount * this.greed);
        this.gold += bonusGold;
        return bonusGold;
    }

    addKill() {
        this.kills++;
    }

    hasPassive(type) {
        return this.passives.includes(type);
    }

    addPassive(type) {
        if (!this.passives.includes(type)) {
            this.passives.push(type);
        }
    }

    getStats() {
        return {
            hp: this.hp,
            maxHp: this.maxHp,
            level: this.level,
            exp: this.exp,
            expToNext: this.expToNext,
            kills: this.kills,
            gold: this.gold,
            might: this.might,
            armor: this.armor,
            speedMul: this.speedMul,
            magnet: this.magnet
        };
    }

    isAlive() {
        return this.alive;
    }

    isInvincible() {
        return this.invincible > 0;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    getFacing() {
        return { ...this.facing };
    }
}