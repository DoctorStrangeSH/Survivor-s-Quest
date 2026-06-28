import { GameModes } from '../gameModes/GameModes.js';

export class ModeSelect {
    constructor(game, onSelect) {
        this.game = game;
        this.onSelect = onSelect;
        this.gameModes = new GameModes();
        this.createUI();
    }

    createUI() {
        const overlay = document.createElement('div');
        overlay.id = 'modeSelect';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 1000;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            background: linear-gradient(135deg, #1e1b4b, #312e81);
            border: 2px solid #7c3aed;
            border-radius: 20px;
            padding: 30px;
            max-width: 700px;
            width: 95%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 60px rgba(124, 58, 237, 0.5);
        `;
        
        const title = document.createElement('h2');
        title.textContent = '🎮 Выберите режим';
        title.style.cssText = `
            color: #a855f7; text-align: center;
            font-family: 'Press Start 2P', monospace;
            font-size: 20px; margin-bottom: 20px;
        `;
        
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        `;
        
        Object.entries(this.gameModes.modes).forEach(([key, mode]) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(255,255,255,0.05);
                border: 2px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s;
                color: white;
                text-align: center;
            `;
            
            card.innerHTML = `
                <div style="font-size: 40px; margin-bottom: 10px;">${mode.icon}</div>
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">
                    ${this.game.i18n.t(mode.name)}
                </div>
                <div style="font-size: 11px; color: #94a3b8;">
                    ${this.game.i18n.t(mode.desc)}
                </div>
                <div style="font-size: 10px; color: #a855f7; margin-top: 8px;">
                    ${mode.timeLimit > 0 ? `⏱ ${mode.timeLimit / 60} мин` : '♾️ Бесконечно'}
                </div>
            `;
            
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#a855f7';
                card.style.background = 'rgba(124,58,237,0.2)';
                card.style.transform = 'scale(1.05)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = 'rgba(255,255,255,0.1)';
                card.style.background = 'rgba(255,255,255,0.05)';
                card.style.transform = 'scale(1)';
            });
            
            card.addEventListener('click', () => {
                overlay.remove();
                this.onSelect(key);
            });
            
            grid.appendChild(card);
        });
        
        container.appendChild(title);
        container.appendChild(grid);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    }
}