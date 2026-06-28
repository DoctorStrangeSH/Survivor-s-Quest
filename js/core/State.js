export const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVELUP: 'levelup',
    DEAD: 'dead',
    SHOP: 'shop'
};

export class StateManager {
    constructor() {
        this.current = GameState.MENU;
        this.previous = null;
        this.listeners = [];
    }

    set(newState) {
        if (this.current === newState) return;
        this.previous = this.current;
        this.current = newState;
        this.listeners.forEach(fn => fn(this.current, this.previous));
    }

    is(...states) {
        return states.includes(this.current);
    }

    onChange(callback) {
        this.listeners.push(callback);
    }
}