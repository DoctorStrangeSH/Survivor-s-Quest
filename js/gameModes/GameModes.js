export class GameModes {
    constructor() {
        this.modes = {
            classic: { name: 'modes.classic', desc: 'modes.classic_desc', icon: '🏰', timeLimit: 0, modifiers: {}, waves: true },
            rush: { name: 'modes.rush', desc: 'modes.rush_desc', icon: '⚡', timeLimit: 300, modifiers: { spawnRate: 2, expMultiplier: 2, moveSpeed: 1.3 }, waves: false },
            survival: { name: 'modes.survival', desc: 'modes.survival_desc', icon: '🛡️', timeLimit: 0, modifiers: { maxWeapons: 1, hpMultiplier: 3, damageMultiplier: 0.5 }, waves: true },
            boss_rush: { name: 'modes.boss_rush', desc: 'modes.boss_rush_desc', icon: '👹', timeLimit: 0, modifiers: { bossOnly: true, startLevel: 5 }, waves: false },
            gold_rush: { name: 'modes.gold_rush', desc: 'modes.gold_rush_desc', icon: '💰', timeLimit: 600, modifiers: { goldMultiplier: 3, expMultiplier: 0.5 }, waves: true },
            chaos: { name: 'modes.chaos', desc: 'modes.chaos_desc', icon: '🎲', timeLimit: 0, modifiers: { randomWeapons: true, spawnRate: 3, enemySpeed: 1.5 }, waves: false }
        };
    }

    getMode(modeId) { return this.modes[modeId] || this.modes.classic; }

    applyModifiers(game, modeId) {
        const mode = this.getMode(modeId);
        if (mode.modifiers.maxWeapons) game.MAX_WEAPONS = mode.modifiers.maxWeapons;
        if (mode.modifiers.hpMultiplier) { game.player.maxHp *= mode.modifiers.hpMultiplier; game.player.hp = game.player.maxHp; }
        if (mode.modifiers.damageMultiplier) game.player.might *= mode.modifiers.damageMultiplier;
        if (mode.modifiers.startLevel) { game.player.level = mode.modifiers.startLevel; }
        return mode;
    }
}