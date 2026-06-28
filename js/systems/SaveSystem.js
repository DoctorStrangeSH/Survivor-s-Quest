export class SaveSystem {
    constructor() {
        this.version = '1.0.0';
        this.keys = {
            settings: 'survivor-settings',
            stats: 'survivor-stats',
            achievements: 'survivor-achievements',
            upgrades: 'survivor-upgrades',
            gold: 'survivor-gold',
            record: 'survivor-record',
            language: 'game-language',
            bestRuns: 'survivor-best-runs'
        };
    }

    // Сохранение настроек
    saveSettings(settings) {
        this.save(this.keys.settings, settings);
    }

    loadSettings() {
        return this.load(this.keys.settings) || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            musicVolume: 0.5,
            sfxVolume: 0.7,
            quality: 'high', // low, medium, high
            showDamage: true,
            showFPS: false,
            screenShake: true,
            particles: true,
            language: 'ru'
        };
    }

    // Сохранение статистики
    saveStats(stats) {
        const current = this.loadStats();
        const updated = {
            totalKills: (current.totalKills || 0) + (stats.kills || 0),
            totalGold: (current.totalGold || 0) + (stats.gold || 0),
            totalTime: (current.totalTime || 0) + (stats.time || 0),
            totalDeaths: (current.totalDeaths || 0) + (stats.died ? 1 : 0),
            maxLevel: Math.max(current.maxLevel || 0, stats.level || 0),
            maxWave: Math.max(current.maxWave || 0, stats.wave || 0),
            gamesPlayed: (current.gamesPlayed || 0) + 1
        };
        this.save(this.keys.stats, updated);
    }

    loadStats() {
        return this.load(this.keys.stats) || {
            totalKills: 0,
            totalGold: 0,
            totalTime: 0,
            totalDeaths: 0,
            maxLevel: 0,
            maxWave: 0,
            gamesPlayed: 0
        };
    }

    // Сохранение лучших результатов
    saveBestRun(run) {
        const bestRuns = this.load(this.keys.bestRuns) || [];
        bestRuns.push({
            ...run,
            date: new Date().toISOString(),
            version: this.version
        });
        
        // Сортируем по убийствам и оставляем топ-10
        bestRuns.sort((a, b) => b.kills - a.kills);
        const top10 = bestRuns.slice(0, 10);
        
        this.save(this.keys.bestRuns, top10);
    }

    loadBestRuns() {
        return this.load(this.keys.bestRuns) || [];
    }

    // Сохранение золота
    saveGold(amount) {
        const current = parseInt(localStorage.getItem(this.keys.gold) || '0');
        localStorage.setItem(this.keys.gold, (current + amount).toString());
    }

    loadGold() {
        return parseInt(localStorage.getItem(this.keys.gold) || '0');
    }

    // Универсальные методы
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }

    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Load failed:', error);
            return null;
        }
    }

    // Экспорт всех сохранений
    exportAll() {
        const data = {};
        Object.entries(this.keys).forEach(([name, key]) => {
            data[name] = this.load(key);
        });
        data.exportDate = new Date().toISOString();
        data.version = this.version;
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survivor-save-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Импорт сохранений
    importAll(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    Object.entries(this.keys).forEach(([name, key]) => {
                        if (data[name]) {
                            this.save(key, data[name]);
                        }
                    });
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Очистка всех данных
    clearAll() {
        Object.values(this.keys).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}