class EventBusClass {
    constructor() { this.events = {}; this.debugMode = false; }

    on(event, callback, priority = 0) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push({ callback, priority });
        this.events[event].sort((a, b) => b.priority - a.priority);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb.callback !== callback);
    }

    emit(event, ...args) {
        if (this.debugMode) console.log(`🔔 Event: ${event}`, args);
        if (!this.events[event]) return;
        this.events[event].forEach(({ callback }) => {
            try { callback(...args); } catch (error) { console.error(`Error in "${event}":`, error); }
        });
    }

    once(event, callback) {
        const wrapper = (...args) => { callback(...args); this.off(event, wrapper); };
        this.on(event, wrapper);
    }

    clear(event) { if (event) delete this.events[event]; else this.events = {}; }
    listenerCount(event) { return this.events[event]?.length || 0; }
    setDebug(enabled) { this.debugMode = enabled; }
}

export const eventBus = new EventBusClass();
export { eventBus as EventBus };