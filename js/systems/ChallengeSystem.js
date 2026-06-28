export class ChallengeSystem {
    constructor() {
        this.challenges = this.generateChallenges();
        this.activeChallenges = this.loadActiveChallenges();
        this.completedChallenges = this.loadCompletedChallenges();
    }

    generateChallenges() {
        return [
            {
                id: 'kill_500',
                name: 'challenges.kill_500',
                desc: 'Убейте 500 врагов за одну игру',
                icon: '💀',
                reward: { gold: 100 },
                check: (stats) => stats.kills >= 500
            },
            {
                id: 'survive_10min',
                name: 'challenges.survive_10min',
                desc: 'Проживите 10 минут',
                icon: '⏱',
                reward: { gold: 150 },
                check: (stats) => stats.time >= 600
            },
            {
                id: 'level_20',
                name: 'challenges.level_20',
                desc: 'Достигните 20 уровня',
                icon: '⭐',
                reward: { gold: 200 },
                check: (stats) => stats.level >= 20
            },
            {
                id: 'evolve_weapon',
                name: 'challenges.evolve',
                desc: 'Эволюционируйте оружие',
                icon: '✨',
                reward: { gold: 300 },
                check: (stats) => stats.evolved
            },
            {
                id: 'no_damage_3min',
                name: 'challenges.no_damage',
                desc: 'Не получайте урон 3 минуты',
                icon: '🛡️',
                reward: { gold: 400 },
                check: (stats) => stats.noDamageTime >= 180
            },
            {
                id: 'collect_1000_gold',
                name: 'challenges.gold_1000',
                desc: 'Соберите 1000 золота за игру',
                icon: '💰',
                reward: { gold: 500 },
                check: (stats) => stats.gold >= 1000
            },
            {
                id: 'all_weapons_max',
                name: 'challenges.max_weapons',
                desc: 'Прокачайте 4 оружия до максимума',
                icon: '⚔️',
                reward: { gold: 600 },
                check: (stats) => stats.maxedWeapons >= 4
            },
            {
                id: 'boss_kill',
                name: 'challenges.boss_kill',
                desc: 'Убейте босса',
                icon: '👹',
                reward: { gold: 350 },
                check: (stats) => stats.bossKills >= 1
            }
        ];
    }

    loadActiveChallenges() {
        const saved = localStorage.getItem('active-challenges');
        if (saved) return JSON.parse(saved);
        
        // Выбираем 3 случайных испытания
        const shuffled = [...this.challenges].sort(() => Math.random() - 0.5);
        const active = shuffled.slice(0, 3).map(c => ({ ...c, progress: 0, completed: false }));
        
        this.saveActiveChallenges(active);
        return active;
    }

    saveActiveChallenges(challenges) {
        localStorage.setItem('active-challenges', JSON.stringify(challenges));
    }

    loadCompletedChallenges() {
        const saved = localStorage.getItem('completed-challenges');
        return saved ? JSON.parse(saved) : [];
    }

    updateProgress(stats) {
        let updated = false;
        
        this.activeChallenges.forEach(challenge => {
            if (challenge.completed) return;
            
            if (challenge.check(stats)) {
                challenge.completed = true;
                challenge.progress = 100;
                this.completeChallenge(challenge);
                updated = true;
            }
        });
        
        if (updated) {
            this.saveActiveChallenges(this.activeChallenges);
        }
    }

    completeChallenge(challenge) {
        // Добавляем в завершенные
        this.completedChallenges.push({
            id: challenge.id,
            completedAt: new Date().toISOString()
        });
        localStorage.setItem('completed-challenges', JSON.stringify(this.completedChallenges));
        
        // Выдаем награду
        const currentGold = parseInt(localStorage.getItem('survivor-gold') || '0');
        localStorage.setItem('survivor-gold', (currentGold + challenge.reward.gold).toString());
        
        // Показываем уведомление
        if (window.game) {
            window.game.showNotification(
                '✅ Испытание выполнено!',
                `${challenge.name}\n+${challenge.reward.gold} 💰`
            );
        }
    }

    refreshChallenges() {
        const shuffled = [...this.challenges].sort(() => Math.random() - 0.5);
        this.activeChallenges = shuffled.slice(0, 3).map(c => ({ ...c, progress: 0, completed: false }));
        this.saveActiveChallenges(this.activeChallenges);
    }
}