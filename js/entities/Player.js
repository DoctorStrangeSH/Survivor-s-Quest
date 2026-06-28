export class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 12;
        this.speed = 200;
        
        // Статы
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 20;
        this.kills = 0;
        this.gold = 0;
        
        // Модификаторы от пассивок
        this.might = 1;      // Множитель урона
        this.armor = 0;      // Броня
        this.area = 1;       // Размер оружия
        this.speedMul = 1;   // Множитель скорости
        this.duration = 1;   // Длительность эффектов
        this.cooldown = 1;   // Перезарядка
        this.luck = 1;       // Удача
        this.greed = 1;      // Множитель золота
        this.magnet = 0;     // Радиус подбора
        
        this.invincible = 0;
        this.facing = { x: 0, y: -1 };
    }

    move(dx, dy, dt) {
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
            this.facing = { x: dx, y: dy };
        }
        
        this.x += dx * this.speed * this.speedMul * dt;
        this.y += dy * this.speed * this.speedMul * dt;
        
        if (this.invincible > 0) {
            this.invincible -= dt;
        }
    }

    takeDamage(damage) {
        const reduced = Math.max(1, damage - this.armor);
        this.hp -= reduced;
    }

    addExp(amount) {
        this.exp += amount;
        return this.exp >= this.expToNext;
    }
}