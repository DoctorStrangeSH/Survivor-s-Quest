export class PickupSystem {
    constructor(player) {
        this.player = player;
        this.pickups = [];
    }

    update(dt) {
        const magnetRange = 30 + this.player.magnet * 50;
        
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const pickup = this.pickups[i];
            
            if (this.player.magnet > 0) {
                const dx = this.player.x - pickup.x;
                const dy = this.player.y - pickup.y;
                const dist = Math.hypot(dx, dy);
                if (dist < magnetRange && dist > 0) {
                    const speed = 300 + 150 * this.player.magnet;
                    pickup.x += (dx/dist)*speed*dt;
                    pickup.y += (dy/dist)*speed*dt;
                }
            }
            
            if (Math.hypot(this.player.x-pickup.x, this.player.y-pickup.y) < 25+this.player.magnet*40) {
                this.collectPickup(pickup);
                this.pickups.splice(i, 1);
            }
        }
    }

    spawnPickup(x, y, type) {
        const configs = {
            exp: { color: '#4ade80', value: 5, size: 5 },
            gold: { color: '#fbbf24', value: 1, size: 4 },
            health: { color: '#ef4444', value: 20, size: 5 }
        };
        const c = configs[type] || configs.exp;
        this.pickups.push({
            x: x+(Math.random()-0.5)*20,
            y: y+(Math.random()-0.5)*20,
            type, color: c.color, value: c.value, count: 1, size: c.size
        });
    }

    collectPickup(pickup) {
        switch(pickup.type) {
            case 'exp': this.player.exp += pickup.value; break;
            case 'gold': this.player.gold += Math.floor(pickup.value*this.player.greed); break;
            case 'health': this.player.heal(pickup.value); break;
        }
    }

    reset() { this.pickups = []; }
}