import { BaseWeapon } from './BaseWeapon.js';

export class KingBible extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'king_bible', name: 'weapons.king_bible', icon: '📖',
            damage: 20, cooldown: 0.1, range: 100, amount: 1, speed: 3, knockback: 10
        });
        this.angle = 0;
        this.orbitRadius = 80;
    }

    update(dt, enemies, projectiles, effects) {
        this.angle += this.speed * 0.03;
        const bookCount = this.getAttackCount();
        for (let i = 0; i < bookCount; i++) {
            const angle = this.angle + (Math.PI*2*i)/bookCount;
            const x = this.player.x + Math.cos(angle)*this.orbitRadius;
            const y = this.player.y + Math.sin(angle)*this.orbitRadius;
            for (let j = 0; j < enemies.length; j++) {
                const enemy = enemies[j];
                if (Math.hypot(enemy.x-x, enemy.y-y) < 35) {
                    enemy.hp -= this.getDamage() * 0.02;
                    enemy.hitFlash = 0.03;
                }
            }
        }
    }

    attack(enemies, projectiles, effects) {}

    getBookPositions() {
        const positions = [];
        const bookCount = this.getAttackCount();
        for (let i = 0; i < bookCount; i++) {
            const angle = this.angle + (Math.PI*2*i)/bookCount;
            positions.push({x:this.player.x+Math.cos(angle)*this.orbitRadius, y:this.player.y+Math.sin(angle)*this.orbitRadius, angle});
        }
        return positions;
    }

    applyLevelUp() {
        switch(this.level) { case 2: this.damage+=10; break; case 3: this.amount=2; break; case 4: this.speed+=1; break; case 5: this.orbitRadius+=20; break; case 6: this.damage+=15; break; case 7: this.amount=3; break; case 8: this.speed+=1; this.damage+=20; break; }
    }
}