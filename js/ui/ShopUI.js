export class ShopUI {
    constructor(game, shopSystem) {
        this.game = game;
        this.shop = shopSystem;
        this.overlay = null;
        this.createUI();
    }

    createUI() {
        const old = document.getElementById('shopOverlay');
        if (old) old.remove();
        
        this.overlay = document.createElement('div');
        this.overlay.id = 'shopOverlay';
        this.overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 2000;
            display: none; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif; pointer-events: auto;
        `;
        
        this.overlay.innerHTML = `
            <div style="background:rgba(30,27,75,0.98);border:2px solid #fbbf24;border-radius:20px;padding:25px;max-width:550px;width:90%;max-height:80vh;overflow-y:auto;color:white;box-shadow:0 0 60px rgba(251,191,36,0.3);pointer-events:auto;">
                <h2 class="font-pixel text-gold text-center mb-3" style="font-size:18px;">🏪 МАГАЗИН</h2>
                <p class="text-center text-light mb-3">💰 Золото: <span id="shopGold" class="text-gold fw-bold fs-5">0</span></p>
                <div id="shopItems" class="d-flex flex-column gap-2"></div>
                <button id="closeShopBtn" class="btn btn-purple font-pixel w-100 mt-3 py-2" style="pointer-events:auto;cursor:pointer;">ЗАКРЫТЬ</button>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        document.getElementById('closeShopBtn').onclick = () => this.hide();
    }

    show() {
        this.overlay.style.display = 'flex';
        this.renderItems();
    }

    hide() {
        this.overlay.style.display = 'none';
    }

    renderItems() {
        const gold = this.game.player?.gold || parseInt(localStorage.getItem('survivor-gold') || '0');
        document.getElementById('shopGold').textContent = gold;
        
        const items = [
            { id: 'maxHp', name: '❤️ Макс. HP', desc: '+20 HP', icon: '❤️' },
            { id: 'damage', name: '⚔️ Урон', desc: '+10% урона', icon: '⚔️' },
            { id: 'armor', name: '🛡️ Броня', desc: '+1 брони', icon: '🛡️' },
            { id: 'speed', name: '🏃 Скорость', desc: '+10% скорости', icon: '🏃' },
            { id: 'area', name: '🎯 Область', desc: '+10% области', icon: '🎯' },
            { id: 'cooldown', name: '⏱ Перезарядка', desc: '-8% перезарядки', icon: '⏱' },
            { id: 'magnet', name: '🧲 Магнит', desc: '+50 подбора', icon: '🧲' },
            { id: 'greed', name: '💰 Жадность', desc: '+15% золота', icon: '💰' },
            { id: 'expBonus', name: '📚 Опыт', desc: '+10% опыта', icon: '📚' }
        ];
        
        const container = document.getElementById('shopItems');
        container.innerHTML = items.map(item => {
            const level = this.shop.getUpgradeLevel(item.id);
            const maxLevel = this.shop.getUpgradeMaxLevel(item.id);
            const cost = this.shop.getUpgradeCost(item.id);
            const maxed = level >= maxLevel;
            
            return `
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;">
                    <span style="font-size:24px;">${item.icon}</span>
                    <div style="flex:1;">
                        <div style="font-weight:700;font-size:13px;">${item.name}</div>
                        <div style="color:#94a3b8;font-size:10px;">${item.desc}</div>
                        <div style="color:#a855f7;font-size:9px;">Ур. ${level}/${maxLevel}</div>
                    </div>
                    <button style="padding:8px 14px;background:${maxed?'#374151':'#22c55e'};color:white;border:none;border-radius:8px;cursor:${maxed?'not-allowed':'pointer'};font-weight:700;font-size:11px;pointer-events:auto;"
                        ${maxed?'disabled':''}
                        onclick="window._buyItem('${item.id}')">
                        ${maxed?'МАКС':`💰 ${cost}`}
                    </button>
                </div>`;
        }).join('');
        
        // Глобальная функция для покупки
        window._buyItem = (itemId) => {
            const cost = this.shop.getUpgradeCost(itemId);
            const currentGold = this.game.player?.gold || parseInt(localStorage.getItem('survivor-gold') || '0');
            
            if (currentGold >= cost) {
                if (this.game.player) this.game.player.gold -= cost;
                else localStorage.setItem('survivor-gold', (currentGold - cost).toString());
                
                this.shop.buyUpgrade(itemId);
                this.renderItems();
                this.game.audio.play('buy');
            }
        };
    }
}