import { BaseWeapon } from './BaseWeapon.js';

export class SantaWater extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'santa_water', name: 'weapons.santa_water', icon: '💧',
            damage: 10, cooldown: 2, range: 150, area: 1, amount: 1, duration: 3
        });
        this.puddles = [];
    }

    attack(enemies, projectiles, effects) {
        for (let i = 0; i < this.getAttackCount(); i++) {
            const angle = Math.random()*Math.PI*2, dist = Math.random()*this.range;
            this.puddles.push({x:this.player.x+Math.cos(angle)*dist, y:this.player.y+Math.sin(angle)*dist, life:this.duration*this.player.duration, radius:30*this.getArea(), damage:this.getDamage()});
        }
    }

    update(dt, enemies, projectiles, effects) {
        super.update(dt, enemies, projectiles, effects);
        for (let i = this.puddles.length-1; i >= 0; i--) {
            const p = this.puddles[i];
            p.life -= dt;
            if (p.life <= 0) { this.puddles.splice(i,1); continue; }
            for (let j = 0; j < enemies.length; j++) {
                if (Math.hypot(enemies[j].x-p.x, enemies[j].y-p.y) < p.radius) {
                    enemies[j].hp -= p.damage*0.2*dt;
                    enemies[j].hitFlash = 0.05;
                }
            }
        }
    }

    getPuddles() { return this.puddles; }

    applyLevelUp() {
        switch(this.level) { case 2: this.damage+=5; break; case 3: this.amount=2; break; case 4: this.duration+=1; break; case 5: this.damage+=10; break; case 6: this.area+=0.5; break; case 7: this.amount=3; break; case 8: this.duration+=2; break; }
    }
}