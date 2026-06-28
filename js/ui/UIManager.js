export class UIManager {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('gameUI');
        this.createUI();
    }

    createUI() {
        this.container.innerHTML = `
            <div id="levelUpMenu" class="menu hidden">
                <div class="menu-content">
                    <h2>LEVEL UP!</h2>
                    <p>Выберите улучшение (клавиши 1-4)</p>
                    <div id="levelUpOptions"></div>
                </div>
            </div>
            
            <div id="pauseMenu" class="menu hidden">
                <div class="menu-content">
                    <h2>ПАУЗА</h2>
                    <button onclick="window.game.togglePause()">Продолжить</button>
                    <button onclick="window.game.start()">Заново</button>
                </div>
            </div>
            
            <div id="deathScreen" class="menu hidden">
                <div class="menu-content">
                    <h2>ВЫ ПОГИБЛИ</h2>
                    <div id="deathStats"></div>
                    <button onclick="window.game.start()">Играть снова</button>
                </div>
            </div>
        `;
    }

    update() {
        // Обновление UI каждый кадр если нужно
    }

    showLevelUp(options) {
        const menu = document.getElementById('levelUpMenu');
        const optionsDiv = document.getElementById('levelUpOptions');
        
        optionsDiv.innerHTML = options.map((opt, i) => `
            <div class="levelup-option" onclick="window.game.selectLevelUpOption(${i})">
                <span class="option-icon">${opt.icon}</span>
                <div>
                    <div class="option-name">${opt.name}</div>
                    <div class="option-type">${opt.type === 'weapon' ? 'Оружие' : 'Пассивный'}</div>
                </div>
                <span class="option-key">${i + 1}</span>
            </div>
        `).join('');
        
        menu.classList.remove('hidden');
    }

    hideLevelUp() {
        document.getElementById('levelUpMenu').classList.add('hidden');
    }

    showPause() {
        document.getElementById('pauseMenu').classList.remove('hidden');
    }

    hidePause() {
        document.getElementById('pauseMenu').classList.add('hidden');
    }

    showDeath(player) {
        const menu = document.getElementById('deathScreen');
        document.getElementById('deathStats').innerHTML = `
            <p>Уровень: ${player.level}</p>
            <p>Убито: ${player.kills}</p>
            <p>Время: ${Math.floor(this.game.gameTime)}с</p>
        `;
        menu.classList.remove('hidden');
    }
}