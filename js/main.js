// ============================================
// Vampire Survivors Web - Main Entry Point
// ============================================

import { Game } from './core/Game.js';

// Глобальные переменные
let game = null;
let i18n = null;

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🎮 Initializing Vampire Survivors Web...');
        
        // Создаем экземпляр игры
        game = new Game();
        window.game = game;
        
        // Инициализируем игру
        await game.init();
        
        // Сохраняем ссылку на i18n
        i18n = game.i18n;
        window.i18n = i18n;
        
        // Добавляем UI элементы
        addLanguageSwitcher();
        addMobileControls();
        
        // Настраиваем обработчики событий
        setupGlobalEvents();
        
        // Показываем стартовый экран
        showStartScreen();
        
        console.log('✅ Game initialized successfully!');
        console.log('📋 Controls: WASD/Arrows - Move | ESC/P - Pause | 1-4 - Level Up');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage(error);
    }
});

// ============================================
// Стартовый экран
// ============================================

function showStartScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'startScreen';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.9);
        z-index: 1000;
        pointer-events: all;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
        background: linear-gradient(135deg, #1e1b4b, #312e81);
        border: 2px solid #7c3aed;
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        color: white;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 0 50px rgba(124, 58, 237, 0.5);
        font-family: 'Inter', sans-serif;
    `;
    
    const title = document.createElement('h1');
    title.textContent = i18n?.t('game.title') || 'Vampire Survivors Web';
    title.style.cssText = `
        font-family: 'Press Start 2P', monospace;
        font-size: 24px;
        color: #a855f7;
        margin-bottom: 30px;
        text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
        line-height: 1.5;
    `;
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Выживи как можно дольше!';
    subtitle.style.cssText = `
        color: #cbd5e1;
        margin-bottom: 30px;
        font-size: 16px;
    `;
    
    const startButton = document.createElement('button');
    startButton.textContent = '🎮 НАЧАТЬ ИГРУ';
    startButton.style.cssText = `
        padding: 15px 40px;
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;
        font-family: 'Press Start 2P', monospace;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
    `;
    
    startButton.addEventListener('mouseenter', () => {
        startButton.style.transform = 'scale(1.05)';
        startButton.style.boxShadow = '0 6px 25px rgba(124, 58, 237, 0.5)';
    });
    
    startButton.addEventListener('mouseleave', () => {
        startButton.style.transform = 'scale(1)';
        startButton.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.3)';
    });
    
    startButton.addEventListener('click', () => {
        overlay.remove();
        game.start();
        
        // Показываем подсказки
        showControlsHint();
    });
    
    const controls = document.createElement('div');
    controls.style.cssText = `
        color: #94a3b8;
        font-size: 12px;
        line-height: 1.8;
        margin-top: 20px;
    `;
    
    controls.innerHTML = `
        <p>🎯 WASD / Стрелки - Движение</p>
        <p>⏸️ ESC / P - Пауза</p>
        <p>⬆️ 1-4 - Выбор улучшения</p>
        <p>🌐 Кнопка справа - Смена языка</p>
    `;
    
    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(startButton);
    container.appendChild(controls);
    
    overlay.appendChild(container);
    document.body.appendChild(overlay);
}

// ============================================
// Подсказки управления
// ============================================

function showControlsHint() {
    const hint = document.createElement('div');
    hint.id = 'controlsHint';
    hint.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: rgba(255, 255, 255, 0.6);
        padding: 10px 20px;
        border-radius: 20px;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        z-index: 50;
        pointer-events: none;
        transition: opacity 1s;
    `;
    
    hint.innerHTML = 'WASD - Движение | ESC - Пауза | 1-4 - Выбор улучшения';
    
    document.body.appendChild(hint);
    
    // Скрываем подсказку через 10 секунд
    setTimeout(() => {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 1000);
    }, 10000);
}

// ============================================
// Переключатель языка
// ============================================

function addLanguageSwitcher() {
    const container = document.createElement('div');
    container.id = 'languageSwitcher';
    container.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        z-index: 200;
        pointer-events: all;
    `;
    
    const button = document.createElement('button');
    button.id = 'langButton';
    button.style.cssText = `
        padding: 10px 15px;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    updateLanguageButton(button);
    
    button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(124, 58, 237, 0.8)';
        button.style.borderColor = '#a855f7';
        button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(0, 0, 0, 0.8)';
        button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', () => {
        if (i18n) {
            i18n.toggleLocale();
            updateLanguageButton(button);
            
            // Небольшая анимация
            button.style.transform = 'scale(0.9)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
        }
    });
    
    container.appendChild(button);
    document.body.appendChild(container);
}

function updateLanguageButton(button) {
    const locale = i18n?.getLocale() || 'ru';
    button.textContent = locale === 'ru' ? '🌐 EN' : '🌐 RU';
    button.title = locale === 'ru' ? 'Switch to English' : 'Переключить на русский';
}

// ============================================
// Мобильные контролы
// ============================================

function addMobileControls() {
    // Определяем мобильное устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return;
    
    console.log('📱 Mobile device detected, adding touch controls');
    
    const container = document.createElement('div');
    container.id = 'mobileControls';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        z-index: 150;
        pointer-events: all;
    `;
    
    // Создаем джойстик
    const joystick = document.createElement('div');
    joystick.id = 'joystick';
    joystick.style.cssText = `
        width: 120px;
        height: 120px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        position: relative;
        touch-action: none;
    `;
    
    const stick = document.createElement('div');
    stick.style.cssText = `
        width: 50px;
        height: 50px;
        background: rgba(124, 58, 237, 0.6);
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    `;
    
    joystick.appendChild(stick);
    
    // Логика джойстика
    let stickActive = false;
    let stickX = 0, stickY = 0;
    
    joystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        stickActive = true;
        updateStick(e.touches[0]);
    });
    
    joystick.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (stickActive) updateStick(e.touches[0]);
    });
    
    joystick.addEventListener('touchend', () => {
        stickActive = false;
        stick.style.transform = 'translate(-50%, -50%)';
        // Отпускаем клавиши
        if (game) {
            game.keys['KeyW'] = false;
            game.keys['KeyS'] = false;
            game.keys['KeyA'] = false;
            game.keys['KeyD'] = false;
        }
    });
    
    function updateStick(touch) {
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        
        const maxDist = 40;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }
        
        stick.style.left = `${50 + (dx / rect.width) * 100}%`;
        stick.style.top = `${50 + (dy / rect.height) * 100}%`;
        
        // Устанавливаем клавиши
        const threshold = 10;
        if (game) {
            game.keys['KeyD'] = dx > threshold;
            game.keys['KeyA'] = dx < -threshold;
            game.keys['KeyS'] = dy > threshold;
            game.keys['KeyW'] = dy < -threshold;
        }
    }
    
    container.appendChild(joystick);
    document.body.appendChild(container);
}

// ============================================
// Глобальные события
// ============================================

function setupGlobalEvents() {
    // Обработка изменения видимости страницы
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game && game.state === 'playing') {
            game.togglePause();
        }
    });
    
    // Предотвращение случайного скролла на мобильных
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('#mobileControls')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Обработка ресайза окна
    window.addEventListener('resize', () => {
        if (game && game.renderer) {
            game.renderer.resize();
        }
    });
    
    // Обработка горячих клавиш
    window.addEventListener('keydown', (e) => {
        // F5 - предотвращаем обновление
        if (e.code === 'F5') {
            e.preventDefault();
            if (game) game.start();
        }
        
        // F11 - полноэкранный режим
        if (e.code === 'F11') {
            // Разрешено по умолчанию
        }
        
        // Ctrl+R - предотвращаем обновление
        if (e.code === 'KeyR' && e.ctrlKey) {
            e.preventDefault();
            if (game) game.start();
        }
    });
    
    // Обработка изменения языка
    document.addEventListener('localeChanged', (e) => {
        console.log(`🌐 Language changed to: ${e.detail.locale}`);
        updateLanguageButton(document.getElementById('langButton'));
    });
    
    // Обработка ошибок
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });
    
    // Обработка необработанных промисов
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });
}

// ============================================
// Экран ошибки
// ============================================

function showErrorMessage(error) {
    document.body.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #0a0a0a;
            font-family: 'Inter', sans-serif;
        ">
            <div style="
                background: linear-gradient(135deg, #1e1b4b, #312e81);
                border: 2px solid #ef4444;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                color: white;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 0 50px rgba(239, 68, 68, 0.5);
            ">
                <h2 style="color: #ef4444; margin-bottom: 20px; font-size: 24px;">
                    ❌ Ошибка загрузки
                </h2>
                <p style="color: #cbd5e1; margin-bottom: 20px; font-size: 14px;">
                    ${error.message || 'Неизвестная ошибка'}
                </p>
                <p style="color: #94a3b8; margin-bottom: 30px; font-size: 12px;">
                    Проверьте консоль для детальной информации
                </p>
                <button onclick="location.reload()" style="
                    padding: 15px 30px;
                    background: #7c3aed;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 700;
                    transition: all 0.3s;
                " onmouseenter="this.style.background='#6d28d9'" 
                   onmouseleave="this.style.background='#7c3aed'">
                    🔄 Перезагрузить страницу
                </button>
            </div>
        </div>
    `;
}

// ============================================
// Экспорт для использования в других модулях
// ============================================

export { game, i18n };