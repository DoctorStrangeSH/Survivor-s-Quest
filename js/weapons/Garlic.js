import { BaseWeapon } from './BaseWeapon.js';

export class Garlic extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'garlic', name: 'weapons.garlic', icon: '🧄',
            damage: 5, cooldown: 0.5, range: 60, area: 1, knockback: 5
        });
    }

    update(dt, enemies, projectiles, effects) {
        const range = this.range * this.getArea();
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const dist = Math.hypot(enemy.x-this.player.x, enemy.y-this.player.y);
            if (dist < range) {
                enemy.hp -= this.getDamage() * 0.02;
                enemy.hitFlash = 0.03;
            }
        }
    }

    attack(enemies, projectiles, effects) {}

    applyLevelUp() {
        switch(this.level) { case 2: this.range+=10; break; case 3: this.damage+=3; break; case 4: this.range+=15; break; case 5: this.damage+=5; break; case 6: this.cooldown*=0.7; break; case 7: this.range+=20; break; case 8: this.damage+=7; break; }
    }
}