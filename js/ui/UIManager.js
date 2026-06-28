import { eventBus } from '../core/EventBus.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.floatingTexts = [];
        
        this.createUI();
        this.setupEvents();
    }

    createUI() {
        const uiContainer = document.getElementById('gameUI');
        if (!uiContainer) {
            console.error('gameUI container not found');
            return;
        }

        uiContainer.innerHTML = `
            <!-- Верхняя панель -->
            <div id="topBar">
                <div class="stat">
                    <span class="stat-label" data-i18n="ui.hp">HP</span>
                    <div class="hp-bar">
                        <div class="hp-fill" id="hpFill"></div>
                    </div>
                    <span id="hpText">50/50</span>
                </div>
                <div class="stat">
                    <span class="stat-label" data-i18n="ui.level">LVL</span>
                    <span id="lvlText">1</span>
                </div>
                <div class="stat">
                    <span class="stat-label" data-i18n="ui.exp">EXP</span>
                    <div class="exp-bar">
                        <div class="exp-fill" id="expFill"></div>
                    </div>
                    <span id="expText">0/30</span>
                </div>
                <div class="stat">
                    <span class="stat-label" data-i18n="ui.gold">💰</span>
                    <span id="goldText">0</span>
                </div>
                <div class="stat">
                    <span class="stat-label" data-i18n="ui.kills">⚔️</span>
                    <span id="killsText">0</span>
                </div>
                <div class="stat">
                    <span class="stat-label" data-i18n="ui.time">⏱</span>
                    <span id="timerText">0:00</span>
                </div>
                <div class="stat">
                    <span class="stat-label" data-i18n="ui.wave">🌊</span>
                    <span id="waveText">1</span>
                </div>
            </div>
            
            <!-- Панель способностей -->
            <div id="abilitiesBar">
                ${this.createAbilitySlot('q', '💥')}
                ${this.createAbilitySlot('e', '❄️')}
                ${this.createAbilitySlot('r', '💚')}
            </div>
            
            <!-- Меню паузы -->
            <div id="pauseMenu" class="hidden">
                <div class="menu-box">
                    <h2 data-i18n="menu.pause">ПАУЗА</h2>
                    <button class="menu-btn" id="resumeBtn" data-i18n="menu.continue">ПРОДОЛЖИТЬ</button>
                    <button class="menu-btn" id="restartBtn" data-i18n="menu.restart">ЗАНОВО</button>
                </div>
            </div>
            
            <!-- Меню Level Up -->
            <div id="levelUpMenu" class="hidden">
                <div class="menu-box wide">
                    <h2 data-i18n="levelup.title">LEVEL UP!</h2>
                    <p data-i18n="levelup.choose">Выбери улучшение:</p>
                    <div id="upgradeCards"></div>
                </div>
            </div>
            
            <!-- Магазин -->
            <div id="shopMenu" class="hidden">
                <div class="menu-box wide">
                    <h2 data-i18n="menu.shop">🏪 МАГАЗИН</h2>
                    <p>💰 Золото: <span id="shopGold">0</span></p>
                    <div id="shopItems"></div>
                    <button class="menu-btn" id="closeShopBtn" data-i18n="menu.close">ЗАКРЫТЬ</button>
                </div>
            </div>
            
            <!-- Экран смерти -->
            <div id="deathScreen" class="hidden">
                <div class="menu-box">
                    <h2 data-i18n="death.title">ТЫ ПОГИБ</h2>
                    <p>⚔️ <span data-i18n="death.kills">Убито</span>: <span id="finalKills">0</span></p>
                    <p>⏱ <span data-i18n="death.time">Время</span>: <span id="finalTime">0:00</span></p>
                    <p>💰 <span data-i18n="death.gold">Золото</span>: <span id="finalGold">0</span></p>
                    <p>🏆 <span data-i18n="death.record">Рекорд</span>: <span id="recordKills">0</span></p>
                    <p>📊 <span data-i18n="death.wave">Волна</span>: <span id="finalWave">1</span></p>
                    <button class="menu-btn" id="playAgainBtn" data-i18n="death.playAgain">ИГРАТЬ СНОВА</button>
                </div>
            </div>
            
            <!-- Подсказки управления -->
            <div id="controlsHint" data-i18n="ui.controls">
                [WASD] Движение | [Q/E/R] Способности | [P] Пауза | [B] Магазин
            </div>
        `;

        // Сохраняем ссылки на элементы
        this.elements = {
            hpFill: document.getElementById('hpFill'),
            hpText: document.getElementById('hpText'),
            lvlText: document.getElementById('lvlText'),
            expFill: document.getElementById('expFill'),
            expText: document.getElementById('expText'),
            goldText: document.getElementById('goldText'),
            killsText: document.getElementById('killsText'),
            timerText: document.getElementById('timerText'),
            waveText: document.getElementById('waveText'),
            pauseMenu: document.getElementById('pauseMenu'),
            levelUpMenu: document.getElementById('levelUpMenu'),
            shopMenu: document.getElementById('shopMenu'),
            deathScreen: document.getElementById('deathScreen'),
            shopGold: document.getElementById('shopGold'),
            shopItems: document.getElementById('shopItems'),
            upgradeCards: document.getElementById('upgradeCards'),
            finalKills: document.getElementById('finalKills'),
            finalTime: document.getElementById('finalTime'),
            finalGold: document.getElementById('finalGold'),
            recordKills: document.getElementById('recordKills'),
            finalWave: document.getElementById('finalWave'),
            abilitiesBar: document.getElementById('abilitiesBar')
        };
    }

    createAbilitySlot(key, icon) {
        return `
            <div class="ability-slot" id="ability${key.toUpperCase()}">
                <div class="ability-key">${key.toUpperCase()}</div>
                <div class="ability-icon">${icon}</div>
                <div class="ability-cooldown" id="cd${key.toUpperCase()}"></div>
            </div>
        `;
    }

    setupEvents() {
        // Кнопки меню
        document.getElementById('resumeBtn')?.addEventListener('click', () => {
            eventBus.emit('ui:resume');
        });
        
        document.getElementById('restartBtn')?.addEventListener('click', () => {
            eventBus.emit('ui:restart');
        });
        
        document.getElementById('playAgainBtn')?.addEventListener('click', () => {
            eventBus.emit('ui:restart');
        });
        
        document.getElementById('closeShopBtn')?.addEventListener('click', () => {
            eventBus.emit('ui:shop:close');
        });
        
        // События локализации
        document.addEventListener('localeChanged', () => {
            this.updateAllTexts();
        });
        
        // Обработчики для способностей
        ['q', 'e', 'r'].forEach(key => {
            document.getElementById(`ability${key.toUpperCase()}`)?.addEventListener('click', () => {
                eventBus.emit('input:ability', key);
            });
        });
    }

    update() {
        this.updateAbilityCooldowns();
    }

    updateHP(current, max) {
        if (this.elements.hpFill && this.elements.hpText) {
            this.elements.hpFill.style.width = `${(current / max) * 100}%`;
            this.elements.hpText.textContent = `${Math.ceil(current)}/${max}`;
        }
    }

    updateEXP(current, max) {
        if (this.elements.expFill && this.elements.expText) {
            this.elements.expFill.style.width = `${(current / max) * 100}%`;
            this.elements.expText.textContent = `${current}/${max}`;
        }
    }

    updateLevel(level) {
        if (this.elements.lvlText) {
            this.elements.lvlText.textContent = level;
        }
    }

    updateGold(gold) {
        if (this.elements.goldText) {
            this.elements.goldText.textContent = gold;
        }
    }

    updateKills(kills) {
        if (this.elements.killsText) {
            this.elements.killsText.textContent = kills;
        }
    }

    updateTimer(time) {
        if (this.elements.timerText) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            this.elements.timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateWave(wave) {
        if (this.elements.waveText) {
            this.elements.waveText.textContent = wave;
        }
    }

    updateAbilityCooldowns() {
        const abilitySystem = this.game.abilitySystem;
        if (!abilitySystem) return;
        
        ['q', 'e', 'r'].forEach(key => {
            const cdElement = document.getElementById(`cd${key.toUpperCase()}`);
            const ability = abilitySystem.getAbility(key);
            
            if (cdElement && ability) {
                if (!ability.isReady()) {
                    cdElement.style.display = 'block';
                    cdElement.textContent = `${ability.getRemainingCooldown()}s`;
                } else {
                    cdElement.style.display = 'none';
                }
            }
        });
    }

    showPauseMenu() {
        this.elements.pauseMenu?.classList.remove('hidden');
    }

    showLevelUpMenu() {
        this.elements.levelUpMenu?.classList.remove('hidden');
        this.generateUpgradeCards();
    }

    showShopMenu() {
        this.elements.shopMenu?.classList.remove('hidden');
        this.renderShop();
    }

    showDeathScreen(stats) {
        if (!this.elements.deathScreen) return;
        
        this.elements.finalKills.textContent = stats.kills;
        this.elements.finalTime.textContent = stats.time;
        this.elements.finalGold.textContent = stats.gold;
        this.elements.finalWave.textContent = stats.wave;
        
        // Рекорд
        const record = parseInt(localStorage.getItem('survivor-record') || '0');
        const bestKills = Math.max(record, stats.kills);
        localStorage.setItem('survivor-record', bestKills.toString());
        this.elements.recordKills.textContent = bestKills;
        
        this.elements.deathScreen.classList.remove('hidden');
    }

    hideAllMenus() {
        ['pauseMenu', 'levelUpMenu', 'shopMenu', 'deathScreen'].forEach(menuId => {
            this.elements[menuId]?.classList.add('hidden');
        });
    }

    generateUpgradeCards() {
        if (!this.elements.upgradeCards) return;
        
        const i18n = window.Game.i18n;
        const upgrades = [
            {
                icon: '⚔️',
                name: i18n.t('upgrades.damage'),
                desc: i18n.t('upgrades.damageDesc'),
                action: () => this.game.player.damage += 10
            },
            {
                icon: '🏃',
                name: i18n.t('upgrades.speed'),
                desc: i18n.t('upgrades.speedDesc'),
                action: () => this.game.player.increaseSpeed(0.15)
            },
            {
                icon: '❤️',
                name: i18n.t('upgrades.maxHp'),
                desc: i18n.t('upgrades.maxHpDesc'),
                action: () => this.game.player.addMaxHP(20)
            },
            {
                icon: '⚡',
                name: i18n.t('upgrades.attackSpeed'),
                desc: i18n.t('upgrades.attackSpeedDesc'),
                action: () => this.game.player.increaseAttackSpeed(0.2)
            },
            {
                icon: '💥',
                name: i18n.t('upgrades.abilityPower'),
                desc: i18n.t('upgrades.abilityPowerDesc'),
                action: () => this.game.player.increaseAbilityPower(1)
            }
        ];
        
        // Выбираем 3 случайных улучшения
        const shuffled = upgrades.sort(() => Math.random() - 0.5).slice(0, 3);
        
        this.elements.upgradeCards.innerHTML = shuffled.map((upgrade, index) => `
            <div class="upgrade-card" data-index="${index}">
                <div class="icon">${upgrade.icon}</div>
                <div class="name">${upgrade.name}</div>
                <div class="desc">${upgrade.desc}</div>
            </div>
        `).join('');
        
        // Добавляем обработчики
        document.querySelectorAll('.upgrade-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                shuffled[index].action();
                this.hideAllMenus();
                eventBus.emit('ui:levelup:complete');
            });
        });
    }

    renderShop() {
        if (!this.elements.shopItems || !this.elements.shopGold) return;
        
        const player = this.game.player;
        const i18n = window.Game.i18n;
        
        this.elements.shopGold.textContent = player.gold;
        
        const items = [
            { name: i18n.t('shop.items.heal5'), price: 10, action: () => player.heal(5) },
            { name: i18n.t('shop.items.maxHp10'), price: 20, action: () => player.addMaxHP(10) },
            { name: i18n.t('shop.items.damage5'), price: 25, action: () => { player.damage += 5; } },
            { name: i18n.t('shop.items.attackSpeed15'), price: 30, action: () => player.increaseAttackSpeed(0.15) },
            { name: i18n.t('shop.items.fullHeal'), price: 15, action: () => player.heal(player.maxHp) }
        ];
        
        this.elements.shopItems.innerHTML = items.map((item, index) => `
            <div class="shop-item">
                <span class="name">${item.name}</span>
                <span class="price">💰 ${item.price}</span>
                <button class="buy-btn" data-index="${index}" ${player.gold < item.price ? 'disabled' : ''}>
                    ${i18n.t('shop.buy')}
                </button>
            </div>
        `).join('');
        
        // Обработчики покупок
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const item = items[index];
                
                if (player.gold >= item.price) {
                    player.gold -= item.price;
                    item.action();
                    eventBus.emit('sound:play', 'buy');
                    this.renderShop(); // Обновляем магазин
                }
            });
        });
    }

    updateAllTexts() {
        const i18n = window.Game.i18n;
        
        // Обновляем data-i18n элементы
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = i18n.t(key);
        });
    }

    addFloatingText(x, y, text, color, life = 1) {
        this.floatingTexts.push({
            x, y, text, color,
            life, maxLife: life
        });
    }

    getFloatingTexts() {
        // Обновляем и возвращаем активные тексты
        this.floatingTexts = this.floatingTexts.filter(text => {
            text.y -= 40 * 0.016; // Примерная скорость подъема
            text.life -= 0.016;
            return text.life > 0;
        });
        
        return this.floatingTexts;
    }
}