import { BaseWeapon } from './BaseWeapon.js';

export class KingBible extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'king_bible',
            name: 'weapons.king_bible',
            icon: '📖',
            damage: 15,
            cooldown: 1.5,
            range: 100,
            amount: 1,
            speed: 2,
            knockback: 8,
            evolution: 'unholy_vespers',
            evolutionPassive: 'spellbinder'
        });
        this.angle = 0;
        this.orbitRadius = 80;
    }

    attack(enemies, projectiles, effects) {
        this.angle += this.speed * 0.1;
        
        for (let i = 0; i < this.amount; i++) {
            const angle = this.angle + (Math.PI * 2 * i) / this.amount;
            const x = this.player.x + Math.cos(angle) * this.orbitRadius;
            const y = this.player.y + Math.sin(angle) * this.orbitRadius;
            
            // Создаем визуальный эффект
            effects.push({
                x, y,
                vx: 0, vy: 0,
                life: 0.05, maxLife: 0.05,
                color: '#fbbf24',
                size: 8
            });
            
            // Наносим урон врагам рядом с книгой
            enemies.forEach(enemy => {
                const dx = enemy.x - x;
                const dy = enemy.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 20) {
                    enemy.takeDamage(this.getDamage() * 0.016);
                    
                    if (this.knockback > 0) {
                        enemy.x += (dx / dist) * this.knockback * 0.1;
                        enemy.y += (dy / dist) * this.knockback * 0.1;
                    }
                }
            });
        }
    }

    applyLevelUp() {
        if (this.level === 2) this.speed += 0.5;
        if (this.level === 3) this.amount = 2;
        if (this.level === 4) this.damage += 10;
        if (this.level === 5) this.orbitRadius += 20;
        if (this.level === 6) this.speed += 0.5;
        if (this.level === 7) this.amount = 3;
        if (this.level === 8) this.damage += 15;
    }
}