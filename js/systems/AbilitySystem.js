import { eventBus } from '../core/EventBus.js';
import { Explosion } from '../abilities/Explosion.js';
import { Freeze } from '../abilities/Freeze.js';
import { Heal } from '../abilities/Heal.js';

export class AbilitySystem {
    constructor(player) {
        this.player = player;
        this.abilities = {
            q: null,
            e: null,
            r: null
        };
        
        this.init();
        this.setupEvents();
    }

    init() {
        this.abilities.q = new Explosion(this.player);
        this.abilities.e = new Freeze(this.player);
        this.abilities.r = new Heal(this.player);
    }

    reset() {
        Object.values(this.abilities).forEach(ability => {
            if (ability) ability.reset();
        });
    }

    setupEvents() {
        eventBus.on('input:ability', (key) => {
            this.useAbility(key);
        });
    }

    update(dt) {
        Object.values(this.abilities).forEach(ability => {
            if (ability) ability.update(dt);
        });
    }

    useAbility(key) {
        const ability = this.abilities[key];
        if (ability && ability.isReady()) {
            const enemies = window.Game?.enemySystem?.getEnemies() || [];
            ability.use(enemies);
            
            eventBus.emit('ability:used', {
                key,
                name: ability.name
            });
        }
    }

    getAbility(key) {
        return this.abilities[key];
    }

    getCooldownPercent(key) {
        const ability = this.abilities[key];
        if (!ability) return 1;
        return ability.getCooldownPercent();
    }
}