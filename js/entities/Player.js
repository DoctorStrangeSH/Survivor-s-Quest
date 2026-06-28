import { EventBus, eventBus } from '../core/EventBus.js';

export class Player {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.radius = 14;
        this.speed = 220;
        
        // Статы
        this.hp = 50;
        this.maxHp = 50;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 30;
        this.kills = 0;
        this.gold = 0;
        
        // Боевые статы
        this.baseDamage = 25;
        this.damage = 25;
        this.attackSpeed = 1.2;
        this.armor = 0;
        
        // Состояния
        this.invincibleTimer = 0;
        this.invincibleDuration = 0.3;
        this.alive = true;
        
        // Направление взгляда
        this.facingX = 0;
        this.facingY = -1;
        
        // Улучшения
        this.upgrades = {
            damage: 0,
            speed: 0,
            maxHp: 0,
            attackSpeed: 0,
            abilityPower: 0,
            armor: 0
        };
    }

    update(dt, inputManager) {
        if (!this.alive) return;
        
        // Движение
        const movement = inputManager.getMovement();
        if (movement.x !== 0 || movement.y !== 0) {
            this.x += movement.x * this.speed * (1 + this.upgrades.speed * 0.15) * dt;
            this.y += movement.y * this.speed * (1 + this.upgrades.speed * 0.15) * dt;
            this.facingX = movement.x;
            this.facingY = movement.y;
        }
        
        // Неуязвимость
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0 || !this.alive) return;
        
        const actualDamage = Math.max(1, amount - this.armor);
        this.hp -= actualDamage;
        this.invincibleTimer = this.invincibleDuration;
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            eventBus.emit('player:death');
        }
        
        eventBus.emit('player:damaged', {
            damage: actualDamage,
            hp: this.hp,
            maxHp: this.maxHp
        });
    }

    heal(amount) {
        if (!this.alive) return;
        
        const actualHeal = Math.min(amount, this.maxHp - this.hp);
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        if (actualHeal > 0) {
            eventBus.emit('player:healed', {
                amount: actualHeal,
                hp: this.hp,
                maxHp: this.maxHp
            });
        }
    }

    addExperience(amount) {
        this.exp += amount;
        
        while (this.exp >= this.expToNext) {
            this.levelUp();
        }
        
        eventBus.emit('player:exp', {
            current: this.exp,
            max: this.expToNext
        });
    }

    levelUp() {
        this.exp -= this.expToNext;
        this.level++;
        this.expToNext = Math.floor(this.expToNext * 1.4);
        
        // Базовые улучшения при повышении уровня
        this.heal(20);
        this.baseDamage += 5;
        this.damage = this.baseDamage + this.upgrades.damage * 10;
        
        eventBus.emit('player:levelup', this.level);
    }

    addGold(amount) {
        this.gold += amount;
        eventBus.emit('player:gold', this.gold);
    }

    addKill() {
        this.kills++;
        eventBus.emit('player:kills', this.kills);
    }

    isInvincible() {
        return this.invincibleTimer > 0;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    upgrade(stat, value) {
        if (this.upgrades[stat] !== undefined) {
            this.upgrades[stat] += value;
            this.recalculateStats();
        }
    }

    recalculateStats() {
        this.damage = this.baseDamage + this.upgrades.damage * 10;
        this.maxHp = 50 + this.upgrades.maxHp * 20;
        this.hp = Math.min(this.hp, this.maxHp);
    }

    addMaxHP(amount) {
        this.maxHp += amount;
        this.hp += amount;
        eventBus.emit('player:healed', {
            amount,
            hp: this.hp,
            maxHp: this.maxHp
        });
    }

    increaseSpeed(percent) {
        this.upgrades.speed += 1;
    }

    increaseAttackSpeed(percent) {
        this.attackSpeed *= (1 + percent);
    }

    increaseAbilityPower(amount) {
        this.upgrades.abilityPower += amount;
    }

    increaseArmor(amount) {
        this.armor += amount;
    }
}