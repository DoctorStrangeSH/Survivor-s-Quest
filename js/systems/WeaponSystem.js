import { Whip } from '../weapons/Whip.js';
import { MagicWand } from '../weapons/MagicWand.js';
import { Garlic } from '../weapons/Garlic.js';
import { FireWand } from '../weapons/FireWand.js';
import { KingBible } from '../weapons/KingBible.js';
import { SantaWater } from '../weapons/SantaWater.js';
import { LightningRing } from '../weapons/LightningRing.js';
import { Axe } from '../weapons/Axe.js';
import { Cross } from '../weapons/Cross.js';

export class WeaponSystem {
    constructor(player) {
        this.player = player;
        this.weapons = [];
        this.projectiles = [];
        this.effects = [];
        
        // Стартовое оружие
        this.addWeapon('whip');
    }

    addWeapon(type) {
        const weapon = this.createWeapon(type);
        if (weapon) {
            this.weapons.push(weapon);
            console.log(`Added weapon: ${type}`);
        }
    }

    createWeapon(type) {
        switch(type) {
            case 'whip': return new Whip(this.player);
            case 'magic_wand': return new MagicWand(this.player);
            case 'garlic': return new Garlic(this.player);
            case 'fire_wand': return new FireWand(this.player);
            case 'king_bible': return new KingBible(this.player);
            case 'santa_water': return new SantaWater(this.player);
            case 'lightning_ring': return new LightningRing(this.player);
            case 'axe': return new Axe(this.player);
            case 'cross': return new Cross(this.player);
            default: return null;
        }
    }

    upgradeWeapon(type) {
        const weapon = this.weapons.find(w => w.type === type);
        if (weapon) {
            weapon.levelUp();
            console.log(`Upgraded ${type} to level ${weapon.level}`);
        }
    }

    update(dt, enemies) {
        // Обновляем оружие
        this.weapons.forEach(weapon => {
            weapon.update(dt, enemies, this.projectiles, this.effects);
        });
        
        // Обновляем снаряды
        this.updateProjectiles(dt, enemies);
        
        // Очищаем старые эффекты
        this.effects = this.effects.filter(e => {
            e.life -= dt;
            return e.life > 0;
        });
    }

    updateProjectiles(dt, enemies) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            
            // Движение
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            
            // Гравитация для топоров
            if (p.gravity) {
                p.vy += 200 * dt;
            }
            
            // Бумеранг для креста
            if (p.boomerang && p.life < 1) {
                const dx = this.player.x - p.x;
                const dy = this.player.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0) {
                    p.vx += (dx / dist) * 300 * dt;
                    p.vy += (dy / dist) * 300 * dt;
                }
            }
            
            // Удаление просроченных или улетевших далеко
            const distFromPlayer = Math.hypot(p.x - this.player.x, p.y - this.player.y);
            if (p.life <= 0 || distFromPlayer > 600) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    getWeaponIcon(type) {
        const icons = {
            whip: '🪢',
            magic_wand: '🪄',
            garlic: '🧄',
            fire_wand: '🔥',
            king_bible: '📖',
            santa_water: '💧',
            lightning_ring: '⚡',
            axe: '🪓',
            cross: '✝️'
        };
        return icons[type] || '❓';
    }
}