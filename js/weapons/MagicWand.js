import { BaseWeapon } from './BaseWeapon.js';

export class MagicWand extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'magic_wand', name: 'weapons.magic_wand', icon: '🪄',
            damage: 12, cooldown: 0.8, range: 300, speed: 400, amount: 1
        });
    }

    attack(enemies, projectiles, effects) {
        if (enemies.length === 0) return;
        let nearest = null, minDist = this.range;
        for (const e of enemies) { const d = Math.hypot(e.x-this.player.x, e.y-this.player.y); if (d < minDist) { minDist = d; nearest = e; } }
        if (!nearest) return;
        
        const attackCount = this.getAttackCount();
        for (let i = 0; i < attackCount; i++) {
            const dx = nearest.x - this.player.x, dy = nearest.y - this.player.y;
            const dist = Math.hypot(dx, dy) || 1;
            const spread = i === 0 ? 0 : (Math.random()-0.5)*0.3;
            const angle = Math.atan2(dy, dx) + spread;
            projectiles.push({x:this.player.x, y:this.player.y, vx:Math.cos(angle)*this.speed, vy:Math.sin(angle)*this.speed, damage:this.getDamage(), life:2, radius:4, color:'#fbbf24', piercing:false});
        }
    }

    applyLevelUp() {
        switch(this.level) { case 2: this.damage+=5; break; case 3: this.amount=2; break; case 4: this.speed+=100; break; case 5: this.damage+=10; break; case 6: this.cooldown*=0.8; break; case 7: this.amount=3; break; case 8: this.damage+=15; break; }
    }
}