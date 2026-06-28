import { BaseWeapon } from './BaseWeapon.js';

export class FireWand extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'fire_wand',
            name: 'weapons.fire_wand',
            icon: '🔥',
            damage: 20,
            cooldown: 1.5,
            range: 250,
            speed: 300,
            amount: 1
        });
    }

    attack(enemies, projectiles, effects) {
        if (enemies.length === 0) return;
        
        // Выбираем случайного врага в радиусе
        const target = this.findRandomEnemy(enemies);
        if (!target) return;
        
        // Выпускаем amount огненных шаров
        for (let i = 0; i < this.amount; i++) {
            const dx = target.x - this.player.x;
            const dy = target.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Небольшой разброс
            const spread = i === 0 ? 0 : (Math.random() - 0.5) * 0.4;
            const angle = Math.atan2(dy, dx) + spread;
            
            projectiles.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * this.speed,
                vy: Math.sin(angle) * this.speed,
                damage: this.getDamage(),
                life: 1.5,
                radius: 6,
                color: '#ef4444',
                piercing: false,
                onHit(enemy, effects) {
                    // Взрыв при попадании
                    for (let i = 0; i < 5; i++) {
                        const a = Math.random() * Math.PI * 2;
                        effects.push({
                            x: enemy.x,
                            y: enemy.y,
                            vx: Math.cos(a) * 80,
                            vy: Math.sin(a) * 80,
                            life: 0.2,
                            maxLife: 0.2,
                            color: '#ff6b35',
                            size: 4
                        });
                    }
                }
            });
        }
        
        // Эффект выстрела
        for (let i = 0; i < 4; i++) {
            effects.push({
                x: this.player.x,
                y: this.player.y,
                vx: (Math.random() - 0.5) * 60,
                vy: (Math.random() - 0.5) * 60,
                life: 0.2,
                maxLife: 0.2,
                color: '#ff6b35',
                size: 3
            });
        }
    }

    findRandomEnemy(enemies) {
        if (enemies.length === 0) return null;
        return enemies[Math.floor(Math.random() * enemies.length)];
    }

    applyLevelUp() {
        switch(this.level) {
            case 2: this.damage += 10; break;
            case 3: this.amount = 2; break;
            case 4: this.speed += 100; break;
            case 5: this.damage += 15; break;
            case 6: this.amount = 3; break;
            case 7: this.range += 50; break;
            case 8: this.damage += 20; break;
        }
    }
}