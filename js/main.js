// Точка входа приложения
import { Game } from './core/Game.js';

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Создаем экземпляр игры
        const game = new Game();
        
        // Делаем доступным глобально (для отладки)
        window.Game = game;
        
        // Инициализируем игру
        await game.init();
        
        // Обработчики для кнопок выбора языка
        document.getElementById('langRu')?.addEventListener('click', () => {
            game.i18n.setLocale('ru');
            game.start();
        });
        
        document.getElementById('langEn')?.addEventListener('click', () => {
            game.i18n.setLocale('en');
            game.start();
        });
        
        console.log('🎮 Game ready!');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        // Показываем сообщение об ошибке
        document.body.innerHTML = `
            <div style="color: white; text-align: center; padding: 50px;">
                <h1>Ошибка загрузки игры</h1>
                <p>${error.message}</p>
                <p>Проверьте консоль для деталей</p>
            </div>
        `;
    }
});