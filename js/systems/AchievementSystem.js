export class AchievementSystem {
    constructor() {
        this.achievements = [];
        this.unlocked = [];
        this.loadAchievements();
    }

    loadAchievements() {
        const saved = localStorage.getItem('survivor-achievements');
        this.unlocked = saved ? JSON.parse(saved) : [];
    }

    saveAchievements() {
        localStorage.setItem('survivor-achievements', JSON.stringify(this.unlocked));
    }

    checkAchievements(stats) {
        const checks = [
            { id: 'first_kill', name: 'Первая кровь', desc: 'Убейте первого врага', icon: '⚔️', check: () => stats.kills >= 1 },
            { id: 'kills_100', name: 'Охотник', desc: 'Убейте 100 врагов', icon: '💀', check: () => stats.kills >= 100 },
            { id: 'kills_1000', name: 'Истребитель', desc: 'Убейте 1000 врагов', icon: '☠️', check: () => stats.kills >= 1000 },
            { id: 'kills_5000', name: 'Машина смерти', desc: 'Убейте 5000 врагов', icon: '👹', check: () => stats.kills >= 5000 },
            { id: 'level_10', name: 'Новичок', desc: 'Достигните 10 уровня', icon: '⭐', check: () => stats.level >= 10 },
            { id: 'level_30', name: 'Ветеран', desc: 'Достигните 30 уровня', icon: '🌟', check: () => stats.level >= 30 },
            { id: 'level_50', name: 'Легенда', desc: 'Достигните 50 уровня', icon: '💫', check: () => stats.level >= 50 },
            { id: 'survive_5min', name: 'Выживший', desc: 'Проживите 5 минут', icon: '⏱', check: () => stats.time >= 300 },
            { id: 'survive_15min', name: 'Стойкий', desc: 'Проживите 15 минут', icon: '⌛', check: () => stats.time >= 900 },
            { id: 'survive_30min', name: 'Бессмертный', desc: 'Проживите 30 минут', icon: '♾️', check: () => stats.time >= 1800 },
            { id: 'wave_5', name: 'Волна 5', desc: 'Дойдите до 5 волны', icon: '🌊', check: () => stats.wave >= 5 },
            { id: 'gold_1000', name: 'Богач', desc: 'Соберите 1000 золота', icon: '💰', check: () => stats.gold >= 1000 },
            { id: 'evolve_weapon', name: 'Эволюция', desc: 'Эволюционируйте оружие', icon: '✨', check: () => stats.evolved },
            { id: 'first_death', name: 'Первая смерть', desc: 'Умрите в первый раз', icon: '💀', check: () => stats.died }
        ];
        
        checks.forEach(achievement => {
            if (!this.unlocked.includes(achievement.id) && achievement.check()) {
                this.unlock(achievement);
            }
        });
    }

    unlock(achievement) {
        this.unlocked.push(achievement.id);
        this.saveAchievements();
        
        // Bootstrap notification
        if (window.game?.environmentEffects) {
            window.game.environmentEffects.showBootstrapNotification(
                '🏆 ДОСТИЖЕНИЕ!',
                `${achievement.icon} ${achievement.name}\n${achievement.desc}`,
                'achievement'
            );
        }
        
        if (window.game) window.game.audio.play('levelup');
    }

    getUnlockedCount() { return this.unlocked.length; }
}