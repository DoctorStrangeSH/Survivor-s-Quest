export class Boss {
    constructor(x, y, wave) {
        this.x = x;
        this.y = y;
        this.radius = 35;
        this.speed = 25 + wave * 2;
        this.hp = 500 + wave * 200;
        this.maxHp = this.hp;
        this.damage = 50 + wave * 5;
        this.exp = 200 + wave * 50;
        this.color = '#ef4444';
        this.type = 'boss';
        this.hitFlash = 0;
        this.phase = 1;
        this.attackTimer = 0;
        this.attackCooldown = 2;
        this.projectiles = [];
    }

    update(dt, player, effects) {
        // Движение к игроку
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        
        // Фазы босса
        if (this.hp < this.maxHp * 0.5 && this.phase === 1) {
            this.phase = 2;
            this.speed *= 1.5;
            this.attackCooldown *= 0.7;
            console.log('👹 Boss phase 2!');
        }
        
        // Атака босса
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            this.attackTimer = this.attackCooldown;
            this.attack(player, effects);
        }
        
        if (this.hitFlash > 0) this.hitFlash -= dt;
    }

    attack(player, effects) {
        // Босс выпускает снаряды по кругу
        const count = this.phase === 1 ? 6 : 12;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Date.now() * 0.001;
            this.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * 150,
                vy: Math.sin(angle) * 150,
                life: 3,
                radius: 8,
                damage: 15,
                color: '#ef4444'
            });
        }
    }
}