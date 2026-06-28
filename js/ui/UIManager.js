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
                    <p>Выберите улучшение (1-4)</p>
                    <div id="levelUpOptions"></div>
                </div>
            </div>
            
            <div id="pauseMenu" class="menu hidden">
                <div class="menu-content">
                    <h2>ПАУЗА</h2>
                    <button id="resumeBtn">ПРОДОЛЖИТЬ (ESC)</button>
                    <button id="restartBtn">ЗАНОВО</button>
                </div>
            </div>
            
            <div id="deathScreen" class="menu hidden">
                <div class="menu-content">
                    <h2>ВЫ ПОГИБЛИ</h2>
                    <div id="deathStats"></div>
                    <button id="playAgainBtn">ИГРАТЬ СНОВА</button>
                </div>
            </div>
            
            <div id="hint" style="
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                color: rgba(255,255,255,0.5);
                font-family: 'Inter', sans-serif;
                font-size: 12px;
                pointer-events: none;
                text-align: center;
            ">WASD - Движение | ESC - Пауза | 1-4 - Выбор</div>
        `;
        
        // Кнопки
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.game.togglePause());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.game.start());
        document.getElementById('playAgainBtn')?.addEventListener('click', () => this.game.start());
    }

    update() {
        // Обновление UI каждый кадр
    }

    showLevelUp(options) {
        const menu = document.getElementById('levelUpMenu');
        const container = document.getElementById('levelUpOptions');
        
        if (!menu || !container) return;
        
        container.innerHTML = options.map((opt, i) => `
            <div class="levelup-option" data-index="${i}">
                <span class="option-icon">${opt.icon}</span>
                <div>
                    <div class="option-name">${opt.name}</div>
                    <div class="option-type">${opt.type === 'weapon' ? 'Новое оружие' : opt.type === 'upgrade' ? 'Улучшение' : 'Пассивный предмет'}</div>
                </div>
                <span class="option-key">${i + 1}</span>
            </div>
        `).join('');
        
        // Добавляем обработчики
        document.querySelectorAll('.levelup-option').forEach(el => {
            el.addEventListener('click', () => {
                const index = parseInt(el.dataset.index);
                this.game.selectLevelUpOption(index);
            });
        });
        
        menu.classList.remove('hidden');
    }

    hideLevelUp() {
        document.getElementById('levelUpMenu')?.classList.add('hidden');
    }

    showPause() {
        document.getElementById('pauseMenu')?.classList.remove('hidden');
    }

    hidePause() {
        document.getElementById('pauseMenu')?.classList.add('hidden');
    }

    showDeath(player) {
        const menu = document.getElementById('deathScreen');
        const stats = document.getElementById('deathStats');
        
        if (!menu || !stats) return;
        
        const minutes = Math.floor(this.game.gameTime / 60);
        const seconds = Math.floor(this.game.gameTime % 60);
        
        stats.innerHTML = `
            <p>🏆 Уровень: ${player.level}</p>
            <p>⚔️ Убито: ${player.kills}</p>
            <p>⏱️ Время: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
            <p>📊 Рекорд: ${localStorage.getItem('survivor-record') || 0}</p>
        `;
        
        menu.classList.remove('hidden');
    }

    hideAll() {
        document.querySelectorAll('.menu').forEach(m => m.classList.add('hidden'));
    }
}