export class DailyChallenge {
    constructor() {
        this.today = this.getTodayString();
        this.challenge = this.generateChallenge();
        this.completed = this.checkCompleted();
        this.bestScore = this.loadBestScore();
    }

    getTodayString() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    }

    generateChallenge() {
        // Используем дату как seed для генерации
        const seed = this.hashCode(this.today);
        const rng = this.createRNG(seed);
        
        const characters = ['antonio', 'imelda', 'pasqualina', 'gennaro', 'arca', 'porta', 'lama', 'krochi'];
        const weapons = ['whip', 'magic_wand', 'garlic', 'fire_wand', 'king_bible', 'santa_water', 'lightning_ring', 'axe', 'cross'];
        const passives = ['spinach', 'armor', 'hollow_heart', 'empty_tome', 'candelabrador', 'spellbinder', 'duplicator', 'attractorb'];
        
        return {
            date: this.today,
            character: characters[Math.floor(rng() * characters.length)],
            startingWeapons: [weapons[Math.floor(rng() * weapons.length)]],
            startingPassives: [passives[Math.floor(rng() * passives.length)]],
            modifiers: {
                enemyHp: 0.8 + rng() * 0.4,
                enemySpeed: 0.8 + rng() * 0.4,
                expRate: 0.8 + rng() * 0.4,
                goldRate: 0.8 + rng() * 0.4
            },
            maxWeapons: 3 + Math.floor(rng() * 4),
            timeLimit: 300 + Math.floor(rng() * 600) // 5-15 минут
        };
    }

    createRNG(seed) {
        let s = seed;
        return function() {
            s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
            return (s >>> 0) / 0xFFFFFFFF;
        };
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    checkCompleted() {
        const saved = localStorage.getItem('daily-challenge');
        if (!saved) return false;
        const data = JSON.parse(saved);
        return data.date === this.today && data.completed;
    }

    loadBestScore() {
        const saved = localStorage.getItem('daily-best');
        if (!saved) return 0;
        const data = JSON.parse(saved);
        return data.date === this.today ? data.score : 0;
    }

    complete(score) {
        this.completed = true;
        if (score > this.bestScore) {
            this.bestScore = score;
            localStorage.setItem('daily-best', JSON.stringify({
                date: this.today,
                score: score
            }));
        }
        localStorage.setItem('daily-challenge', JSON.stringify({
            date: this.today,
            completed: true,
            score: score
        }));
    }

    getReward() {
        // Награда зависит от результата
        if (this.bestScore > 1000) return { gold: 500, exp: 200 };
        if (this.bestScore > 500) return { gold: 200, exp: 100 };
        if (this.bestScore > 100) return { gold: 50, exp: 30 };
        return { gold: 20, exp: 10 };
    }
}