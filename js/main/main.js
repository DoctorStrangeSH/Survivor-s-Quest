// Точка входа приложения
import { Game } from './core/Game.js';
import { EventBus } from './core/EventBus.js';
import { I18n } from './utils/I18n.js';

// Глобальный экземпляр игры
window.Game = new Game();

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.Game.init();
});