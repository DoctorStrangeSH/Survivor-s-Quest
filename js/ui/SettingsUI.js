export class SettingsUI {
    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.settings = game.saveSystem.loadSettings();
        this.createUI();
    }

    createUI() {
        // Удаляем старый если есть
        const old = document.getElementById('settingsOverlay');
        if (old) old.remove();
        
        this.overlay = document.createElement('div');
        this.overlay.id = 'settingsOverlay';
        this.overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 2000;
            display: none; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif; pointer-events: auto;
        `;
        
        this.overlay.innerHTML = `
            <div style="background:rgba(30,27,75,0.98);border:2px solid #7c3aed;border-radius:20px;padding:25px;max-width:480px;width:90%;max-height:85vh;overflow-y:auto;color:white;box-shadow:0 0 60px rgba(124,58,237,0.5);pointer-events:auto;">
                <h2 class="font-pixel text-purple text-center mb-3" style="font-size:16px;">⚙️ НАСТРОЙКИ</h2>
                
                <div class="mb-3">
                    <label class="form-label text-light small fw-bold">🌐 Язык / Language</label>
                    <select id="settingLanguage" class="form-select bg-dark text-light border-secondary" style="pointer-events:auto;cursor:pointer;">
                        <option value="ru">🇷🇺 Русский</option>
                        <option value="en">🇬🇧 English</option>
                    </select>
                </div>
                
                <div class="mb-3">
                    <label class="form-label text-light small fw-bold">🎵 Музыка: <span id="musicVolumeValue" class="text-purple">50%</span></label>
                    <input type="range" id="settingMusic" class="form-range" min="0" max="100" value="50" style="pointer-events:auto;cursor:pointer;">
                </div>
                
                <div class="mb-3">
                    <label class="form-label text-light small fw-bold">🔊 Звуки: <span id="sfxVolumeValue" class="text-purple">70%</span></label>
                    <input type="range" id="settingSFX" class="form-range" min="0" max="100" value="70" style="pointer-events:auto;cursor:pointer;">
                </div>
                
                <div class="mb-3">
                    <label class="form-label text-light small fw-bold">🎨 Качество</label>
                    <select id="settingQuality" class="form-select bg-dark text-light border-secondary" style="pointer-events:auto;cursor:pointer;">
                        <option value="high">🟢 Высокое</option>
                        <option value="medium">🟡 Среднее</option>
                        <option value="low">🔴 Низкое</option>
                    </select>
                </div>
                
                <div class="mb-3">
                    <label class="form-label text-light small fw-bold">✨ Эффекты</label>
                    <div class="form-check"><input class="form-check-input" type="checkbox" id="settingParticles" checked style="pointer-events:auto;cursor:pointer;"><label class="form-check-label text-light small" for="settingParticles">Частицы</label></div>
                    <div class="form-check"><input class="form-check-input" type="checkbox" id="settingShadows" checked style="pointer-events:auto;cursor:pointer;"><label class="form-check-label text-light small" for="settingShadows">Тени</label></div>
                    <div class="form-check"><input class="form-check-input" type="checkbox" id="settingGlow" checked style="pointer-events:auto;cursor:pointer;"><label class="form-check-label text-light small" for="settingGlow">Свечение</label></div>
                    <div class="form-check"><input class="form-check-input" type="checkbox" id="settingShake" checked style="pointer-events:auto;cursor:pointer;"><label class="form-check-label text-light small" for="settingShake">Тряска экрана</label></div>
                </div>
                
                <div class="mb-3">
                    <div class="form-check"><input class="form-check-input" type="checkbox" id="settingFPS" style="pointer-events:auto;cursor:pointer;"><label class="form-check-label text-light small" for="settingFPS">📊 Показывать FPS</label></div>
                </div>
                
                <div class="d-grid gap-2">
                    <button id="saveSettingsBtn" class="btn btn-success font-pixel py-2" style="pointer-events:auto;cursor:pointer;">💾 СОХРАНИТЬ</button>
                    <button id="closeSettingsBtn" class="btn btn-outline-light font-pixel py-2" style="pointer-events:auto;cursor:pointer;">❌ ЗАКРЫТЬ</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        this.loadSettings();
        this.setupEvents();
    }

    loadSettings() {
        const s = this.settings;
        document.getElementById('settingLanguage').value = s.language || 'ru';
        document.getElementById('settingMusic').value = (s.musicVolume || 0.5) * 100;
        document.getElementById('settingSFX').value = (s.sfxVolume || 0.7) * 100;
        document.getElementById('settingQuality').value = s.quality || 'high';
        document.getElementById('settingParticles').checked = s.particles !== false;
        document.getElementById('settingShadows').checked = s.shadows !== false;
        document.getElementById('settingGlow').checked = s.glow !== false;
        document.getElementById('settingShake').checked = s.screenShake !== false;
        document.getElementById('settingFPS').checked = s.showFPS === true;
        this.updateVolumeLabels();
    }

    setupEvents() {
        document.getElementById('settingMusic').addEventListener('input', () => this.updateVolumeLabels());
        document.getElementById('settingSFX').addEventListener('input', () => this.updateVolumeLabels());
        
        document.getElementById('saveSettingsBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.save();
        });
        
        document.getElementById('closeSettingsBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.hide();
        });
    }

    updateVolumeLabels() {
        document.getElementById('musicVolumeValue').textContent = document.getElementById('settingMusic').value + '%';
        document.getElementById('sfxVolumeValue').textContent = document.getElementById('settingSFX').value + '%';
    }

    save() {
        const settings = {
            language: document.getElementById('settingLanguage').value,
            musicVolume: parseInt(document.getElementById('settingMusic').value) / 100,
            sfxVolume: parseInt(document.getElementById('settingSFX').value) / 100,
            quality: document.getElementById('settingQuality').value,
            particles: document.getElementById('settingParticles').checked,
            shadows: document.getElementById('settingShadows').checked,
            glow: document.getElementById('settingGlow').checked,
            screenShake: document.getElementById('settingShake').checked,
            showFPS: document.getElementById('settingFPS').checked
        };
        
        this.game.saveSystem.saveSettings(settings);
        this.game.settings = settings;
        this.game.applySettings();
        
        if (settings.language !== this.game.i18n.getLocale()) {
            this.game.i18n.setLocale(settings.language);
        }
        
        this.hide();
        console.log('✅ Settings saved!');
    }

    show() {
        this.loadSettings();
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.overlay.style.display = 'none';
    }
}