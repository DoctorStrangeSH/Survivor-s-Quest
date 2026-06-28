import { eventBus } from '../core/EventBus.js';
import { Dagger } from '../weapons/Dagger.js';
import { Axe } from '../weapons/Axe.js';
import { Flamethrower } from '../weapons/Flamethrower.js';
import { Lightning } from '../weapons/Lightning.js';
import { Aura } from '../weapons/Aura.js';

export class WeaponSystem {
    constructor(player) {
        this.player = player;
        this.weapons = [];
        this.projectiles = [];
        this.effects = [];
        this.currentWeaponIndex = 0;
        
        // Регистрация оружий
        this.weaponRegistry = {
            dagger: Dagger,
            axe: Axe,
            flamethrower: Flamethrower,
            lightning: Lightning,
            aura: Aura
        };
        
        this.init();
    }

    init() {
        // Начальное оружие
        this.addWeapon('dagger');
    }

    reset() {
        this.weapons = [];
        this.projectiles = [];
        this.effects = [];
        this.currentWeaponIndex = 0;
        this.init();
    }

    addWeapon(type) {
        if (this.weaponRegistry[type]) {
            const weapon = new this.weaponRegistry[type](this.player);
            this.weapons.push(weapon);
        }
    }

    update(dt, enemies) {
        // Обновление всех оружий
        this.weapons.forEach(weapon => {
            weapon.update(dt, enemies, this);
        });
        
        // Обновление снарядов
        this.updateProjectiles(dt);
        
        // Обновление эффектов
        this.updateEffects(dt);
    }

    updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(dt);
            
            if (projectile.isExpired()) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    updateEffects(dt) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life -= dt;
            
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
                continue;
            }
            
            effect.x += effect.vx * dt;
            effect.y += effect.vy * dt;
        }
    }

    spawnProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    spawnEffect(effect) {
        this.effects.push(effect);
    }

    getProjectiles() {
        return this.projectiles;
    }

    getEffects() {
        return this.effects;
    }

    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            this.currentWeaponIndex = index;
        }
    }

    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }

    getWeapons() {
        return this.weapons;
    }
}