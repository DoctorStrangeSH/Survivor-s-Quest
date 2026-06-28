import { BaseWeapon } from './BaseWeapon.js';

export class FireWand extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'fire_wand', name: 'weapons.fire_wand', icon: '🔥',
            damage: 20, cooldown: 1.5, range: 250, speed: 300, amount: 1
        });
    }

    attack(enemies, projectiles, effects) {
        if (enemies.length === 0) return;
        const target = enemies[Math.floor(Math.random()*enemies.length)];
        if (!target) return;
        const attackCount = this.getAttackCount();
        for (let i = 0; i < attackCount; i++) {
            const dx = target.x-this.player.x, dy = target.y-this.player.y;
            const dist = Math.hypot(dx, dy) || 1;
            const spread = i===0?0:(Math.random()-0.5)*0.4;
            const angle = Math.atan2(dy, dx) + spread;
            projectiles.push({x:this.player.x, y:this.player.y, vx:Math.cos(angle)*this.speed, vy:Math.sin(angle)*this.speed, damage:this.getDamage(), life:1.5, radius:6, color:'#ef4444', piercing:false});
        }
    }

    applyLevelUp() {
        switch(this.level) { case 2: this.damage+=10; break; case 3: this.amount=2; break; case 4: this.speed+=100; break; case 5: this.damage+=15; break; case 6: this.amount=3; break; case 7: this.range+=50; break; case 8: this.damage+=20; break; }
    }
}