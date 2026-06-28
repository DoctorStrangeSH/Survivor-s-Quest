import { Game } from './core/Game.js';
import { Characters } from './entities/Character.js';
import { GameModes } from './gameModes/GameModes.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🎮 Starting Vampire Survivors Web...');
        const game = new Game();
        window.game = game;
        await game.init();
        showMainMenu(game);
        console.log('✅ Game ready!');
    } catch (error) {
        console.error('❌ Failed to initialize:', error);
        showError(error);
    }
});

function showMainMenu(game) {
    const oldScreen = document.getElementById('startScreen');
    if (oldScreen) oldScreen.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'startScreen';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.92);z-index:1000;font-family:Inter,sans-serif;';
    
    overlay.innerHTML = `
        <div class="card-dark text-center p-4" style="max-width:500px;width:95%;max-height:90vh;overflow-y:auto;">
            <div class="mb-2"><span class="display-1">🧛</span></div>
            <h1 class="font-pixel text-purple mb-1" style="font-size:1.2rem;">VAMPIRE</h1>
            <h1 class="font-pixel text-purple mb-3" style="font-size:1.2rem;">SURVIVORS</h1>
            <p class="text-light mb-3 small">Выживи как можно дольше!</p>
            
            <!-- Выбор персонажа -->
            <div class="mb-3">
                <label class="text-purple small fw-bold mb-2 d-block">👤 ВЫБЕРИТЕ ПЕРСОНАЖА</label>
                <div id="characterGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;"></div>
                <div id="selectedCharacter" class="text-light small mt-2" style="min-height:20px;"></div>
            </div>
            
            <!-- Выбор режима -->
            <div class="mb-3">
                <label class="text-purple small fw-bold mb-2 d-block">🎮 РЕЖИМ ИГРЫ</label>
                <select id="modeSelect" style="width:100%;padding:8px;background:rgba(0,0,0,0.5);color:white;border:1px solid rgba(255,255,255,0.2);border-radius:8px;font-size:12px;cursor:pointer;">
                    <option value="classic" style="background:#1e1b4b;">🏰 Классика</option>
                    <option value="rush" style="background:#1e1b4b;">⚡ Раш (5 мин)</option>
                    <option value="survival" style="background:#1e1b4b;">🛡️ Выживание (1 оружие)</option>
                    <option value="boss_rush" style="background:#1e1b4b;">👹 Босс-раш</option>
                    <option value="gold_rush" style="background:#1e1b4b;">💰 Золотая лихорадка</option>
                    <option value="chaos" style="background:#1e1b4b;">🎲 Хаос</option>
                </select>
            </div>
            
            <div class="d-grid gap-2">
                <button id="startGameBtn" class="btn btn-purple btn-lg font-pixel py-3">🎮 ИГРАТЬ</button>
                <button id="shopBtnMenu" class="btn btn-gold font-pixel py-2">🏪 МАГАЗИН</button>
                <button id="settingsBtnMenu" class="btn btn-outline-light font-pixel py-2">⚙️ НАСТРОЙКИ</button>
            </div>
            
            <div class="mt-3 text-start small text-light p-2 rounded-3" style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);">
                <p class="mb-0" style="font-size:10px;">🎯 WASD - Движение | ⚔️ Авто-атака | 1-4 - Улучшения | ESC - Пауза</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Заполняем персонажей
    const characterGrid = document.getElementById('characterGrid');
    let selectedChar = 'antonio';
    
    Object.entries(Characters).forEach(([key, char]) => {
        const card = document.createElement('div');
        card.style.cssText = `
            padding:8px;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.1);
            border-radius:10px;cursor:pointer;text-align:center;transition:all 0.2s;
            color:white;font-size:10px;
        `;
        card.innerHTML = `
            <div style="font-size:24px;">${char.icon}</div>
            <div style="font-weight:700;font-size:9px;margin-top:3px;">${game.i18n.t(char.name)}</div>
        `;
        card.title = game.i18n.t(char.description);
        
        card.addEventListener('click', () => {
            document.querySelectorAll('#characterGrid > div').forEach(c => {
                c.style.borderColor = 'rgba(255,255,255,0.1)';
                c.style.background = 'rgba(255,255,255,0.05)';
            });
            card.style.borderColor = '#a855f7';
            card.style.background = 'rgba(168,85,247,0.2)';
            selectedChar = key;
            document.getElementById('selectedCharacter').innerHTML = `
                <span style="color:#a855f7;">${game.i18n.t(char.name)}</span> - ${game.i18n.t(char.description)}
            `;
        });
        
        if (key === 'antonio') {
            card.style.borderColor = '#a855f7';
            card.style.background = 'rgba(168,85,247,0.2)';
            document.getElementById('selectedCharacter').innerHTML = `
                <span style="color:#a855f7;">${game.i18n.t(char.name)}</span> - ${game.i18n.t(char.description)}
            `;
        }
        
        characterGrid.appendChild(card);
    });
    
    // Кнопка ИГРАТЬ
    document.getElementById('startGameBtn').addEventListener('click', () => {
        const modeId = document.getElementById('modeSelect').value;
        const character = Characters[selectedChar];
        overlay.remove();
        game.startWithCharacter(character, modeId);
    });
    
    // Кнопка МАГАЗИН
    document.getElementById('shopBtnMenu').addEventListener('click', async () => {
        const { ShopUI } = await import('./ui/ShopUI.js');
        new ShopUI(game, game.shopSystem).show();
    });
    
    // Кнопка НАСТРОЙКИ
    document.getElementById('settingsBtnMenu').addEventListener('click', async () => {
        const { SettingsUI } = await import('./ui/SettingsUI.js');
        new SettingsUI(game).show();
    });

    // Кнопка МЕНЮ
    document.addEventListener('showMainMenu', () => {
    showMainMenu(window.game);
});
}

function showError(error) {
    document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;font-family:Inter,sans-serif;">
            <div style="background:#1e1b4b;border:2px solid #ef4444;border-radius:20px;padding:40px;text-align:center;color:white;max-width:400px;width:90%;">
                <span class="display-1">❌</span>
                <h2 class="text-red font-pixel mt-3 mb-2" style="font-size:16px;">ОШИБКА</h2>
                <p class="text-light mb-3 small">${error.message}</p>
                <button onclick="location.reload()" class="btn btn-purple font-pixel py-2 w-100">🔄 ПЕРЕЗАГРУЗИТЬ</button>
            </div>
        </div>
    `;
}

window.addEventListener('error', (e) => console.error('Global error:', e.error));
window.addEventListener('unhandledrejection', (e) => console.error('Unhandled:', e.reason));