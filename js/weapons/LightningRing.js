import { BaseWeapon } from './BaseWeapon.js';

export class LightningRing extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'lightning_ring', name: 'weapons.lightning_ring', icon: '⚡',
            damage: 15, cooldown: 2, range: 200, amount: 1
        });
    }

    attack(enemies, projectiles, effects) {
        if (enemies.length === 0) return;
        for (let i = 0; i < this.getAttackCount(); i++) {
            const target = enemies[Math.floor(Math.random()*enemies.length)];
            if (target) { target.hp -= this.getDamage(); target.hitFlash = 0.2; }
        }
    }

    applyLevelUp() {
        switch(this.level) { case 2: this.damage+=10; break; case 3: this.amount=2; break; case 4: this.range+=50; break; case 5: this.damage+=15; break; case 6: this.cooldown*=0.7; break; case 7: this.amount=3; break; case 8: this.damage+=20; break; }
    }
}