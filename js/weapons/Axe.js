import { BaseWeapon } from './BaseWeapon.js';

export class Axe extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'axe', name: 'weapons.axe', icon: '🪓',
            damage: 20, cooldown: 1.5, range: 150, speed: 250, amount: 1
        });
    }

    attack(enemies, projectiles, effects) {
        for (let i = 0; i < this.getAttackCount(); i++) {
            const angle = -Math.PI/2 + (i-(this.getAttackCount()-1)/2)*0.3;
            projectiles.push({x:this.player.x, y:this.player.y, vx:Math.cos(angle)*this.speed, vy:Math.sin(angle)*this.speed*1.5, damage:this.getDamage(), life:1.2, radius:6, color:'#92400e', piercing:true, gravity:true});
        }
    }

    applyLevelUp() {
        switch(this.level) { case 2: this.damage+=10; break; case 3: this.amount=2; break; case 4: this.speed+=100; break; case 5: this.damage+=15; break; case 6: this.amount=3; break; case 7: this.range+=50; break; case 8: this.damage+=20; break; }
    }
}