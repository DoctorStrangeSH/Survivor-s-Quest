import { BaseWeapon } from './BaseWeapon.js';

export class MagicWand extends BaseWeapon {
    constructor(player) {
        super(player, {
            type: 'magic_wand',
            name: 'weapons.magic_wand',
            icon: '🪄',
            damage: 12,
            cooldown: 0.8,
            range: 300,
            speed: 400,
            amount: 1
        });
    }

    attack(enemies, projectiles, effects) {
        if (enemies.length === 0) return;
        
        // Находим ближайшего врага
        const target = this.findNearestEnemy(enemies);
        if (!target) return;
        
        // Выпускаем amount снарядов
        for (let i = 0; i < this.amount; i++) {
            const dx = target.x - this.player.x;
            const dy = target.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Добавляем небольшой разброс
            const spread = i === 0 ? 0 : (Math.random() - 0.5) * 0.3;
            const angle = Math.atan2(dy, dx) + spread;
            
            projectiles.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * this.speed,
                vy: Math.sin(angle) * this.speed,
                damage: this.getDamage(),
                life: 2,
                radius: 4,
                color: '#fbbf24',
                piercing: false
            });
        }
        
        // Визуальный эффект выстрела
        for (let i = 0; i < 3; i++) {
            effects.push({
                x: this.player.x,
                y: this.player.y,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                life: 0.15,
                maxLife: 0.15,
                color: '#fbbf24',
                size: 2
            });
        }
    }

    findNearestEnemy(enemies) {
        let nearest = null;
        let minDist = this.range;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });
        
        return nearest;
    }

    applyLevelUp() {
        switch(this.level) {
            case 2: this.damage += 5; break;
            case 3: this.amount = 2; break;
            case 4: this.speed += 100; break;
            case 5: this.damage += 10; break;
            case 6: this.cooldown *= 0.8; break;
            case 7: this.amount = 3; break;
            case 8: this.damage += 15; break;
        }
    }
}