// Управление состояниями игры
export const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    DEAD: 'dead',
    LEVELUP: 'levelup',
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
        
        this.listeners.forEach(listener => listener(this.current, this.previous));
        
        // Эмиттим событие для других модулей
        import('./EventBus.js').then(module => {
            module.eventBus.emit('stateChange', {
                new: this.current,
                previous: this.previous
            });
        });
    }

    is(...states) {
        return states.includes(this.current);
    }

    onChange(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
}