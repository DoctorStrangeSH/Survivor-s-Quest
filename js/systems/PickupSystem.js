export class PickupSystem {
    constructor(player) {
        this.player = player;
        this.pickups = [];
    }

    update(dt) {
        const magnetRange = 30 + this.player.magnet * 50;
        
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const pickup = this.pickups[i];
            pickup.life -= dt;
            
            // Притягивание опыта при наличии магнита
            if (this.player.magnet > 0 && pickup.type === 'exp') {
                const dx = this.player.x - pickup.x;
                const dy = this.player.y - pickup.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < magnetRange) {
                    const speed = 300 * this.player.magnet;
                    pickup.x += (dx / dist) * speed * dt;
                    pickup.y += (dy / dist) * speed * dt;
                }
            }
            
            // Проверка подбора
            const dx = this.player.x - pickup.x;
            const dy = this.player.y - pickup.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.player.radius + 15) {
                this.collectPickup(pickup);
                this.pickups.splice(i, 1);
            }
            
            // Удаление просроченных
            if (pickup.life <= 0) {
                this.pickups.splice(i, 1);
            }
        }
    }

    spawnPickup(x, y, type) {
        const configs = {
            exp: { color: '#4ade80', life: 15, value: 5, icon: '💎' },
            gold: { color: '#fbbf24', life: 20, value: 1, icon: '🪙' },
            health: { color: '#ef4444', life: 10, value: 20, icon: '❤️' },
            treasure: { color: '#a855f7', life: 8, value: 50, icon: '👑' }
        };
        
        const config = configs[type] || configs.exp;
        
        this.pickups.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            type: type,
            color: config.color,
            life: config.life,
            value: config.value,
            icon: config.icon
        });
    }

    collectPickup(pickup) {
        switch(pickup.type) {
            case 'exp':
                this.player.exp += pickup.value;
                break;
            case 'gold':
                this.player.gold += pickup.value * this.player.greed;
                break;
            case 'health':
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + pickup.value);
                break;
            case 'treasure':
                this.player.gold += pickup.value * this.player.greed;
                break;
        }
    }
}