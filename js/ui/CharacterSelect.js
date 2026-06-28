import { Characters } from '../entities/Character.js';

export class CharacterSelect {
    constructor(game, onSelect) {
        this.game = game;
        this.onSelect = onSelect;
        this.createUI();
    }

    createUI() {
        const overlay = document.createElement('div');
        overlay.id = 'characterSelect';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
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
        title.textContent = '👤 Выберите персонажа';
        title.style.cssText = `
            color: #a855f7;
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
            font-family: 'Press Start 2P', monospace;
        `;
        
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
        `;
        
        Object.entries(Characters).forEach(([key, char]) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(255,255,255,0.05);
                border: 2px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                color: white;
            `;
            
            card.innerHTML = `
                <div style="font-size: 40px; margin-bottom: 10px;">${char.icon}</div>
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 5px;">${this.game.i18n.t(char.name)}</div>
                <div style="font-size: 11px; color: #94a3b8;">${this.game.i18n.t(char.description)}</div>
                <div style="font-size: 10px; color: #a855f7; margin-top: 8px;">
                    +${char.bonuses.might > 0 ? '💪' : ''}
                    ${char.bonuses.armor > 0 ? '🛡️' : ''}
                    ${char.bonuses.speed > 0 ? '🏃' : ''}
                    ${char.startingWeapon}
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
                this.onSelect(char);
            });
            
            grid.appendChild(card);
        });
        
        container.appendChild(title);
        container.appendChild(grid);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    }
}