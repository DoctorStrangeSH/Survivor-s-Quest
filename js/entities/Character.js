export class Character {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.icon = config.icon;
        this.description = config.description;
        this.startingWeapon = config.startingWeapon;
        this.characterType = config.characterType || config.id;
        this.bodyColor = config.bodyColor || '#c084fc';
        this.glowColor = config.glowColor || '#a855f7';
        this.bonuses = {
            might: config.might || 0,
            armor: config.armor || 0,
            speed: config.speed || 0,
            area: config.area || 0,
            duration: config.duration || 0,
            cooldown: config.cooldown || 0,
            luck: config.luck || 0,
            greed: config.greed || 0,
            magnet: config.magnet || 0,
            amount: config.amount || 0,
            maxHp: config.maxHp || 0,
            expBonus: config.expBonus || 0
        };
    }

    applyBonuses(player) {
        player.might += this.bonuses.might;
        player.armor += this.bonuses.armor;
        player.speedMul += this.bonuses.speed;
        player.area += this.bonuses.area;
        player.duration += this.bonuses.duration;
        player.cooldown += this.bonuses.cooldown;
        player.luck += this.bonuses.luck;
        player.greed += this.bonuses.greed;
        player.magnet += this.bonuses.magnet;
        player.amount += this.bonuses.amount;
        if (this.bonuses.maxHp > 0) {
            player.maxHp += this.bonuses.maxHp;
            player.hp += this.bonuses.maxHp;
        }
        if (this.bonuses.expBonus > 0) {
            player.expBonus = this.bonuses.expBonus;
        }
        
        // Применяем визуальные настройки
        player.characterIcon = this.icon;
        player.characterType = this.characterType;
        player.bodyColor = this.bodyColor;
        player.glowColor = this.glowColor;
    }
}

export const Characters = {
    antonio: new Character({
        id: 'antonio',
        characterType: 'antonio',
        name: 'characters.antonio',
        icon: '⚔️',
        description: 'characters.antonio_desc',
        startingWeapon: 'whip',
        bodyColor: '#ef4444',
        glowColor: '#dc2626',
        might: 0.2,
        maxHp: 20
    }),
    
    imelda: new Character({
        id: 'imelda',
        characterType: 'imelda',
        name: 'characters.imelda',
        icon: '🪄',
        description: 'characters.imelda_desc',
        startingWeapon: 'magic_wand',
        bodyColor: '#fbbf24',
        glowColor: '#f59e0b',
        expBonus: 0.2,
        magnet: 2
    }),
    
    pasqualina: new Character({
        id: 'pasqualina',
        characterType: 'pasqualina',
        name: 'characters.pasqualina',
        icon: '🧄',
        description: 'characters.pasqualina_desc',
        startingWeapon: 'garlic',
        bodyColor: '#4ade80',
        glowColor: '#22c55e',
        area: 0.2,
        armor: 1
    }),
    
    gennaro: new Character({
        id: 'gennaro',
        characterType: 'gennaro',
        name: 'characters.gennaro',
        icon: '🔥',
        description: 'characters.gennaro_desc',
        startingWeapon: 'fire_wand',
        bodyColor: '#f97316',
        glowColor: '#ea580c',
        amount: 1
    }),
    
    arca: new Character({
        id: 'arca',
        characterType: 'arca',
        name: 'characters.arca',
        icon: '📖',
        description: 'characters.arca_desc',
        startingWeapon: 'king_bible',
        bodyColor: '#8b5cf6',
        glowColor: '#7c3aed',
        cooldown: 0.15,
        duration: 0.2
    }),
    
    porta: new Character({
        id: 'porta',
        characterType: 'porta',
        name: 'characters.porta',
        icon: '⚡',
        description: 'characters.porta_desc',
        startingWeapon: 'lightning_ring',
        bodyColor: '#06b6d4',
        glowColor: '#0891b2',
        cooldown: 0.3,
        area: 0.1
    }),
    
    lama: new Character({
        id: 'lama',
        characterType: 'lama',
        name: 'characters.lama',
        icon: '🪓',
        description: 'characters.lama_desc',
        startingWeapon: 'axe',
        bodyColor: '#78716c',
        glowColor: '#57534e',
        might: 0.1,
        speed: 0.15
    }),
    
    krochi: new Character({
        id: 'krochi',
        characterType: 'krochi',
        name: 'characters.krochi',
        icon: '✝️',
        description: 'characters.krochi_desc',
        startingWeapon: 'cross',
        bodyColor: '#eab308',
        glowColor: '#ca8a04',
        speed: 0.2,
        magnet: 3
    })
};