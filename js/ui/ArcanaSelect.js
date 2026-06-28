export class ArcanaSelect {
    constructor(game, arcanaSystem) {
        this.game = game;
        this.arcanaSystem = arcanaSystem;
    }

    show() {
        const options = this.arcanaSystem.getRandomArcana(3);
        
        const overlay = document.createElement('div');
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
        
        overlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1e1b4b, #312e81);
                border: 2px solid #fbbf24;
                border-radius: 20px;
                padding: 30px;
                max-width: 600px;
                width: 95%;
                box-shadow: 0 0 60px rgba(251, 191, 36, 0.3);
                color: white;
                text-align: center;
            ">
                <h2 style="color: #fbbf24; font-family: 'Press Start 2P', monospace; font-size: 20px; margin-bottom: 20px;">
                    🃏 ВЫБЕРИТЕ АРКАНУ
                </h2>
                <p style="color: #94a3b8; margin-bottom: 20px;">Выберите одну карту для усиления</p>
                <div style="display: flex; gap: 15px; justify-content: center;" id="arcanaCards"></div>
            </div>
        `;
        
        const cardsContainer = overlay.querySelector('#arcanaCards');
        
        options.forEach(arcana => {
            const card = document.createElement('div');
            card.style.cssText = `
                flex: 1;
                background: rgba(255,255,255,0.05);
                border: 2px solid rgba(251,191,36,0.3);
                border-radius: 15px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            `;
            
            card.innerHTML = `
                <div style="font-size: 40px; margin-bottom: 10px;">${arcana.icon}</div>
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">${arcana.name}</div>
                <div style="font-size: 11px; color: #94a3b8;">${arcana.desc}</div>
            `;
            
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#fbbf24';
                card.style.background = 'rgba(251,191,36,0.1)';
                card.style.transform = 'scale(1.05)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = 'rgba(251,191,36,0.3)';
                card.style.background = 'rgba(255,255,255,0.05)';
                card.style.transform = 'scale(1)';
            });
            
            card.addEventListener('click', () => {
                this.arcanaSystem.selectArcana(arcana.id);
                arcana.apply(this.game.player);
                overlay.remove();
                this.game.audio.play('levelup');
                console.log(`🃏 Activated: ${arcana.name}`);
            });
            
            cardsContainer.appendChild(card);
        });
        
        document.body.appendChild(overlay);
    }
}