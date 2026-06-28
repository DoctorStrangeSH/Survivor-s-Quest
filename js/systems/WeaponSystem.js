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
        }
    }

    createWeapon(type) {
        switch(type) {
            case 'whip':
                return {
                    type: 'whip',
                    level: 1,
                    damage: 15,
                    cooldown: 1.2,
                    timer: 0,
                    range: 80,
                    arc: Math.PI / 2,
                    attack(dir) {
                        // Атака хлыстом по дуге
                        return { damage: this.damage, range: this.range, arc: this.arc };
                    }
                };
            case 'magic_wand':
                return {
                    type: 'magic_wand',
                    level: 1,
                    damage: 12,
                    cooldown: 0.8,
                    timer: 0,
                    range: 300,
                    speed: 400,
                    attack(target) {
                        return { damage: this.damage, speed: this.speed, target };
                    }
                };
            case 'garlic':
                return {
                    type: 'garlic',
                    level: 1,
                    damage: 5,
                    cooldown: 0.5,
                    timer: 0,
                    range: 60,
                    pulse() {
                        return { damage: this.damage, range: this.range };
                    }
                };
            // Добавь другие типы оружия
            default:
                return null;
        }
    }

    update(dt, enemies) {
        this.weapons.forEach(weapon => {
            weapon.timer -= dt * (1 / this.player.cooldown);
            
            if (weapon.timer <= 0) {
                weapon.timer = weapon.cooldown;
                this.attack(weapon, enemies);
            }
        });
        
        // Обновление снарядов
        this.updateProjectiles(dt);
    }

    attack(weapon, enemies) {
        switch(weapon.type) {
            case 'whip':
                this.attackWhip(weapon, enemies);
                break;
            case 'magic_wand':
                this.attackMagicWand(weapon, enemies);
                break;
            case 'garlic':
                this.attackGarlic(weapon, enemies);
                break;
        }
    }

    attackWhip(weapon, enemies) {
        const facing = this.player.facing;
        enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < weapon.range) {
                const angle = Math.atan2(dy, dx);
                const facingAngle = Math.atan2(facing.y, facing.x);
                let diff = angle - facingAngle;
                
                if (Math.abs(diff) < weapon.arc / 2) {
                    enemy.takeDamage(weapon.damage * this.player.might);
                }
            }
        });
    }

    attackMagicWand(weapon, enemies) {
        if (enemies.length === 0) return;
        
        const target = enemies.reduce((nearest, enemy) => {
            const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
            if (dist < nearest.dist) return { enemy, dist };
            return nearest;
        }, { enemy: enemies[0], dist: Infinity }).enemy;
        
        this.projectiles.push({
            x: this.player.x,
            y: this.player.y,
            vx: (target.x - this.player.x) / Math.hypot(target.x - this.player.x, target.y - this.player.y) * weapon.speed,
            vy: (target.y - this.player.y) / Math.hypot(target.x - this.player.x, target.y - this.player.y) * weapon.speed,
            damage: weapon.damage * this.player.might,
            life: 2
        });
    }

    attackGarlic(weapon, enemies) {
        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
            if (dist < weapon.range) {
                enemy.takeDamage(weapon.damage * this.player.might * 0.016);
            }
        });
    }

    updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            
            if (p.life <= 0) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    getAvailableWeapons() {
        const currentTypes = this.weapons.map(w => w.type);
        const allWeapons = ['whip', 'magic_wand', 'garlic', 'fire_wand', 'king_bible', 'santa_water', 'lightning_ring', 'axe', 'cross'];
        
        return allWeapons
            .filter(type => !currentTypes.includes(type))
            .map(type => ({
                type: 'weapon',
                id: type,
                name: this.getWeaponName(type),
                icon: this.getWeaponIcon(type),
                level: 1
            }));
    }

    getWeaponName(type) {
        const names = {
            whip: 'Хлыст',
            magic_wand: 'Волшебная палочка',
            garlic: 'Чеснок',
            fire_wand: 'Огненный жезл',
            king_bible: 'Библия',
            santa_water: 'Святая вода',
            lightning_ring: 'Кольцо молний',
            axe: 'Топор',
            cross: 'Крест'
        };
        return names[type] || type;
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