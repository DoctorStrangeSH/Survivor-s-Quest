import { eventBus } from '../core/EventBus.js';

export class InputManager {
    constructor() {
        this.keys = {};
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseDown = false;
        
        this.init();
    }

    init() {
        // Клавиатура
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.handleKeyPress(e.key.toLowerCase());
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Мышь
        window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });
        
        window.addEventListener('mousedown', () => {
            this.isMouseDown = true;
        });
        
        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
    }

    handleKeyPress(key) {
        switch(key) {
            case 'p':
            case 'escape':
                eventBus.emit('input:pause');
                break;
            case 'b':
                eventBus.emit('input:shop');
                break;
            case 'q':
                eventBus.emit('input:ability', 'q');
                break;
            case 'e':
                eventBus.emit('input:ability', 'e');
                break;
            case 'r':
                eventBus.emit('input:ability', 'r');
                break;
            case '1':
                eventBus.emit('input:switchWeapon', 0);
                break;
            case '2':
                eventBus.emit('input:switchWeapon', 1);
                break;
            case '3':
                eventBus.emit('input:switchWeapon', 2);
                break;
            case '4':
                eventBus.emit('input:switchWeapon', 3);
                break;
            case '5':
                eventBus.emit('input:switchWeapon', 4);
                break;
        }
    }

    getMovement() {
        let dx = 0;
        let dy = 0;
        
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;
        
        // Нормализация движения
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            dx /= length;
            dy /= length;
        }
        
        return { x: dx, y: dy };
    }

    isKeyPressed(key) {
        return !!this.keys[key.toLowerCase()];
    }

    getMousePosition() {
        return { ...this.mousePosition };
    }
}