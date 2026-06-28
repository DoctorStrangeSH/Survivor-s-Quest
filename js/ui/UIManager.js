export class UIManager {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('gameUI');
        this.currentLevelUpOptions = null;
        this.settingsUI = null;
        this.shopUI = null;
        this.createUI();
        this.initUIComponents();
    }

    async initUIComponents() {
        try {
            const { SettingsUI } = await import('./SettingsUI.js');
            this.settingsUI = new SettingsUI(this.game);
        } catch (error) {
            console.warn('Settings not loaded:', error);
        }
        
        try {
            const { ShopUI } = await import('./ShopUI.js');
            this.shopUI = new ShopUI(this.game, this.game.shopSystem);
        } catch (error) {
            console.warn('Shop not loaded:', error);
        }
    }

    createUI() {
        this.container.innerHTML = `
            <div id="levelUpMenu" class="menu hidden">
                <div class="menu-content" style="max-width:600px;width:95%;pointer-events:auto;">
                    <h2 id="levelupTitle" class="font-pixel text-purple text-center mb-3">LEVEL UP!</h2>
                    <p id="levelupSubtitle" class="text-light text-center mb-3 small">Choose upgrade</p>
                    <div id="levelUpOptions" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;"></div>
                </div>
            </div>
            
            <div id="pauseMenu" class="menu hidden">
                <div class="menu-content text-center" style="max-width:400px;pointer-events:auto;">
                    <h2 id="pauseTitle" class="font-pixel text-purple mb-4">PAUSE</h2>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <button id="resumeBtn" class="btn btn-purple font-pixel py-3 w-100" style="pointer-events:auto;cursor:pointer;">CONTINUE (ESC)</button>
                        <button id="restartBtn" class="btn btn-outline-light font-pixel py-2 w-100" style="pointer-events:auto;cursor:pointer;">RESTART</button>
                        <button id="settingsBtnPause" class="btn btn-outline-light font-pixel py-2 w-100" style="pointer-events:auto;cursor:pointer;">⚙️ SETTINGS</button>
                        <button id="menuBtn" class="btn btn-outline-danger font-pixel py-2 w-100" style="pointer-events:auto;cursor:pointer;">🏠 TO MENU</button>
                    </div>
                </div>
            </div>
            
            <div id="deathScreen" class="menu hidden">
                <div class="menu-content text-center" style="max-width:400px;pointer-events:auto;">
                    <h2 id="deathTitle" class="font-pixel text-red mb-4">YOU DIED</h2>
                    <div id="deathStats" class="text-light mb-4"></div>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <button id="playAgainBtn" class="btn btn-purple font-pixel py-3 w-100" style="pointer-events:auto;cursor:pointer;">PLAY AGAIN</button>
                        <button id="menuBtnDeath" class="btn btn-outline-light font-pixel py-2 w-100" style="pointer-events:auto;cursor:pointer;">🏠 TO MENU</button>
                    </div>
                </div>
            </div>
            
            <div id="inventorySlots">
                <div class="mb-1"><small id="weaponLabel" class="text-purple fw-bold text-uppercase" style="font-size:9px;letter-spacing:1px;">⚔️ WEAPONS</small></div>
                <div id="weaponSlots" style="display:flex;flex-direction:column;gap:3px;"></div>
                <div class="mt-2 mb-1"><small id="passiveLabel" class="text-green fw-bold text-uppercase" style="font-size:9px;letter-spacing:1px;">🛡️ PASSIVES</small></div>
                <div id="passiveSlots" style="display:flex;flex-direction:column;gap:3px;"></div>
            </div>
        `;
        
        this.setupEventListeners();
        
        document.addEventListener('localeChanged', () => {
            this.updateAllTexts();
            if (this.currentLevelUpOptions && !document.getElementById('levelUpMenu').classList.contains('hidden')) {
                this.refreshLevelUpMenu();
            }
        });
        
        setTimeout(() => this.updateAllTexts(), 100);
    }

    setupEventListeners() {
        const resumeBtn = document.getElementById('resumeBtn');
        const restartBtn = document.getElementById('restartBtn');
        const playAgainBtn = document.getElementById('playAgainBtn');
        const settingsBtn = document.getElementById('settingsBtnPause');
        const menuBtn = document.getElementById('menuBtn');
        const menuBtnDeath = document.getElementById('menuBtnDeath');
        
        if (resumeBtn) resumeBtn.onclick = () => this.game.togglePause();
        if (restartBtn) restartBtn.onclick = () => this.game.start();
        if (playAgainBtn) playAgainBtn.onclick = () => this.game.start();
        if (settingsBtn) settingsBtn.onclick = () => this.openSettings();
        if (menuBtn) menuBtn.onclick = () => this.game.goToMenu();
        if (menuBtnDeath) menuBtnDeath.onclick = () => this.game.goToMenu();
    }

    openSettings() {
        if (this.settingsUI) {
            this.settingsUI.show();
        } else {
            import('./SettingsUI.js').then(m => {
                this.settingsUI = new m.SettingsUI(this.game);
                this.settingsUI.show();
            });
        }
    }

    openShop() {
        if (this.shopUI) {
            this.shopUI.show();
        } else {
            import('./ShopUI.js').then(m => {
                this.shopUI = new m.ShopUI(this.game, this.game.shopSystem);
                this.shopUI.show();
            });
        }
    }

    update() { this.updateSlots(); }

    updateSlots() {
        const weaponSlots = document.getElementById('weaponSlots');
        const passiveSlots = document.getElementById('passiveSlots');
        const i18n = this.game.i18n;
        if (!weaponSlots || !passiveSlots) return;
        
        const wl = document.getElementById('weaponLabel');
        const pl = document.getElementById('passiveLabel');
        if (wl) wl.textContent = '⚔️ ' + i18n.t('ui.weapons');
        if (pl) pl.textContent = '🛡️ ' + i18n.t('ui.passives');
        
        let wh = '';
        for (let i = 0; i < this.game.MAX_WEAPONS; i++) {
            const w = this.game.weaponSystem.weapons[i];
            if (w) {
                wh += `<div style="width:40px;height:40px;background:rgba(124,58,237,0.3);border:2px solid #7c3aed;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;position:relative;" title="${i18n.t(w.name)} LV${w.level}">${w.icon}<span style="position:absolute;bottom:-2px;right:-2px;background:#7c3aed;color:#fff;font-size:8px;width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${w.level}</span></div>`;
            } else {
                wh += `<div style="width:40px;height:40px;background:rgba(255,255,255,0.05);border:2px dashed rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,0.3);">+</div>`;
            }
        }
        weaponSlots.innerHTML = wh;
        
        let ph = '';
        for (let i = 0; i < this.game.MAX_PASSIVES; i++) {
            const p = this.game.player.passives[i];
            if (p) {
                const icon = this.getPassiveIcon(p.type);
                ph += `<div style="width:40px;height:40px;background:rgba(34,197,94,0.2);border:2px solid #22c55e;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;position:relative;" title="${i18n.t('passives.'+p.type)} LV${p.level}">${icon}<span style="position:absolute;bottom:-2px;right:-2px;background:#22c55e;color:#fff;font-size:8px;width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${p.level}</span></div>`;
            } else {
                ph += `<div style="width:40px;height:40px;background:rgba(255,255,255,0.03);border:2px dashed rgba(255,255,255,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,0.2);">+</div>`;
            }
        }
        passiveSlots.innerHTML = ph;
    }

    getPassiveIcon(type) {
        const icons = {spinach:'🥬',armor:'🛡️',hollow_heart:'❤️',empty_tome:'📖',candelabrador:'🕯️',spellbinder:'🔮',duplicator:'🔄',attractorb:'🧲'};
        return icons[type] || '❓';
    }

    showLevelUp(options) {
        this.currentLevelUpOptions = options;
        const menu = document.getElementById('levelUpMenu');
        if (!menu) return;
        document.getElementById('levelupTitle').textContent = this.game.i18n.t('levelup.title');
        document.getElementById('levelupSubtitle').textContent = this.game.i18n.t('levelup.subtitle');
        this.renderLevelUpOptions(options);
        menu.classList.remove('hidden');
    }

    renderLevelUpOptions(options) {
        const container = document.getElementById('levelUpOptions');
        const i18n = this.game.i18n;
        if (!container || !options) return;
        
        container.innerHTML = options.map((opt, i) => {
            let desc = '', typeText = '', badgeBg = '#7c3aed';
            if (opt.type === 'weapon') { desc = i18n.t(`weapons.${opt.id}_desc`); typeText = i18n.t('ui.new_weapon'); }
            else if (opt.type === 'upgrade') { desc = `${i18n.t('ui.level_num')} ${opt.level}/${opt.maxLevel||8}`; typeText = i18n.t('ui.upgrade'); badgeBg = '#3b82f6'; }
            else { desc = i18n.t(`passives.${opt.id}_desc`); typeText = i18n.t('ui.passive'); badgeBg = '#22c55e'; }
            
            return `
                <div data-index="${i}" style="background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.1);border-radius:12px;padding:15px;cursor:pointer;transition:all 0.2s;flex:1;min-width:130px;max-width:180px;display:flex;align-items:center;gap:10px;color:white;position:relative;pointer-events:auto;"
                     onmouseenter="this.style.borderColor='#a855f7';this.style.background='rgba(168,85,247,0.1)';this.style.transform='translateY(-3px)'"
                     onmouseleave="this.style.borderColor='rgba(255,255,255,0.1)';this.style.background='rgba(255,255,255,0.05)';this.style.transform='translateY(0)'"
                     onclick="window.game.selectLevelUpOption(${i})">
                    <span style="font-size:30px;">${opt.icon}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:700;font-size:13px;margin-bottom:3px;">${opt.name}</div>
                        <div style="color:#94a3b8;font-size:10px;line-height:1.3;margin-bottom:4px;">${desc}</div>
                        <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:600;background:${badgeBg};color:white;">${typeText}</span>
                    </div>
                    <span style="position:absolute;top:-8px;right:-8px;background:#7c3aed;color:#fff;width:22px;height:22px;border-radius:50%;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;">${i+1}</span>
                </div>`;
        }).join('');
    }

    refreshLevelUpMenu() {
        if (this.currentLevelUpOptions) {
            document.getElementById('levelupTitle').textContent = this.game.i18n.t('levelup.title');
            document.getElementById('levelupSubtitle').textContent = this.game.i18n.t('levelup.subtitle');
            this.renderLevelUpOptions(this.currentLevelUpOptions);
        }
    }

    hideLevelUp() { 
        const m = document.getElementById('levelUpMenu'); 
        if (m) m.classList.add('hidden'); 
        this.currentLevelUpOptions = null; 
    }
    
    showPause() { 
        const m = document.getElementById('pauseMenu'); 
        if (m) { m.classList.remove('hidden'); this.updatePauseTexts(); }
    }
    
    hidePause() { 
        const m = document.getElementById('pauseMenu'); 
        if (m) m.classList.add('hidden'); 
    }

    showDeath(player, stats) {
        const menu = document.getElementById('deathScreen');
        const sd = document.getElementById('deathStats');
        const i18n = this.game.i18n;
        if (!menu || !sd) return;
        const m = Math.floor(stats.time/60), s = Math.floor(stats.time%60);
        sd.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;"><span>🏆 ${i18n.t('death.level')}</span><span class="text-purple fw-bold">${stats.level}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;"><span>⚔️ ${i18n.t('death.kills')}</span><span class="text-purple fw-bold">${stats.kills}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;"><span>⏱️ ${i18n.t('death.time')}</span><span class="text-purple fw-bold">${m}:${s.toString().padStart(2,'0')}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;"><span>🌊 ${i18n.t('death.wave')}</span><span class="text-purple fw-bold">${stats.wave}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;"><span>👑 ${i18n.t('death.record')}</span><span class="text-gold fw-bold">${stats.record}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span>💰 ${i18n.t('death.gold')}</span><span class="text-gold fw-bold">${player.gold}</span></div>`;
        menu.classList.remove('hidden');
    }

    hideAll() { 
        document.querySelectorAll('.menu').forEach(m => m.classList.add('hidden')); 
        this.currentLevelUpOptions = null; 
    }

    updateAllTexts() {
        const i18n = this.game.i18n;
        
        const els = {
            levelupTitle: document.getElementById('levelupTitle'),
            levelupSubtitle: document.getElementById('levelupSubtitle'),
            pauseTitle: document.getElementById('pauseTitle'),
            deathTitle: document.getElementById('deathTitle'),
            resumeBtn: document.getElementById('resumeBtn'),
            restartBtn: document.getElementById('restartBtn'),
            playAgainBtn: document.getElementById('playAgainBtn')
        };
        
        if (els.levelupTitle) els.levelupTitle.textContent = i18n.t('levelup.title');
        if (els.levelupSubtitle) els.levelupSubtitle.textContent = i18n.t('levelup.subtitle');
        if (els.pauseTitle) els.pauseTitle.textContent = i18n.t('ui.pause');
        if (els.deathTitle) els.deathTitle.textContent = i18n.t('death.title');
        if (els.resumeBtn) els.resumeBtn.textContent = i18n.t('ui.continue') + ' (ESC)';
        if (els.restartBtn) els.restartBtn.textContent = i18n.t('ui.restart');
        if (els.playAgainBtn) els.playAgainBtn.textContent = i18n.t('death.playAgain');
        
        // Кнопки с текстом внутри
        const menuBtn = document.getElementById('menuBtn');
        const menuBtnDeath = document.getElementById('menuBtnDeath');
        const settingsBtn = document.getElementById('settingsBtnPause');
        
        if (menuBtn) menuBtn.innerHTML = '🏠 ' + (i18n.getLocale()==='ru'?'В МЕНЮ':'TO MENU');
        if (menuBtnDeath) menuBtnDeath.innerHTML = '🏠 ' + (i18n.getLocale()==='ru'?'В МЕНЮ':'TO MENU');
        if (settingsBtn) settingsBtn.innerHTML = '⚙️ ' + (i18n.getLocale()==='ru'?'НАСТРОЙКИ':'SETTINGS');
        
        this.updateSlots();
    }

    updatePauseTexts() {
        const i18n = this.game.i18n;
        const resumeBtn = document.getElementById('resumeBtn');
        const restartBtn = document.getElementById('restartBtn');
        if (resumeBtn) resumeBtn.textContent = i18n.t('ui.continue') + ' (ESC)';
        if (restartBtn) restartBtn.textContent = i18n.t('ui.restart');
    }
}