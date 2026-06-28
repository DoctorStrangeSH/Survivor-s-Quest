import { BaseWeapon } from './BaseWeapon.js';

export class Whip extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'whip', name: 'weapons.whip', icon: '🪢',
            damage: 15, cooldown: 1.2, range: 80, area: 1, amount: 1, knockback: 10
        });
        this.arc = Math.PI * 0.6;
    }

    attack(enemies, projectiles, effects) {
        const damage = this.getDamage();
        const range = this.range * this.getArea();
        const facingAngle = Math.atan2(this.player.facing.y, this.player.facing.x);
        const attackCount = this.getAttackCount();
        
        for (let i = 0; i < attackCount; i++) {
            const offsetAngle = i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * Math.PI / 6;
            const currentAngle = facingAngle + offsetAngle;
            
            for (let j = 0; j < enemies.length; j++) {
                const enemy = enemies[j];
                const edx = enemy.x - this.player.x;
                const edy = enemy.y - this.player.y;
                const edist = Math.hypot(edx, edy);
                
                if (edist < range) {
                    const angleToEnemy = Math.atan2(edy, edx);
                    let angleDiff = angleToEnemy - currentAngle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    
                    if (Math.abs(angleDiff) < this.arc / 2) {
                        enemy.hp -= damage;
                        enemy.hitFlash = 0.15;
                    }
                }
            }
        }
    }

    applyLevelUp() {
        switch(this.level) { case 2: this.damage+=8; break; case 3: this.arc+=Math.PI/5; break; case 4: this.damage+=12; break; case 5: this.amount=2; break; case 6: this.range+=25; break; case 7: this.damage+=15; break; case 8: this.cooldown*=0.75; break; }
    }
}