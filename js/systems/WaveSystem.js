export class WaveSystem {
    constructor() {
        this.wave = 1;
        this.timer = 0;
        this.waveDuration = 30; // 30 секунд на волну
        this.bossSpawned = false;
    }

    update(dt, gameTime) {
        this.timer += dt;
        
        // Каждые 30 секунд новая волна
        if (this.timer >= this.waveDuration) {
            this.wave++;
            this.timer = 0;
            this.bossSpawned = false;
            console.log(`🌊 Wave ${this.wave}!`);
        }
    }

    getWave() {
        return this.wave;
    }

    getSpawnInterval() {
        // Уменьшаем интервал с каждой волной
        return Math.max(0.3, 2.0 - this.wave * 0.1);
    }

    getEnemyType() {
        const types = ['bat'];
        const rand = Math.random();
        
        if (this.wave >= 2) types.push('skeleton');
        if (this.wave >= 3) types.push('zombie');
        if (this.wave >= 4) types.push('ghost');
        if (this.wave >= 5) types.push('werewolf');
        if (this.wave >= 7) types.push('medusa');
        if (this.wave >= 8) types.push('golem');
        if (this.wave >= 10) types.push('vampire');
        
        // Босс каждые 5 волн (с шансом)
        if (this.wave % 5 === 0 && !this.bossSpawned && Math.random() < 0.3) {
            this.bossSpawned = true;
            return 'boss';
        }
        
        // Смерть появляется после 15 волны
        if (this.wave >= 15 && rand < 0.05) {
            return 'death';
        }
        
        return types[Math.floor(Math.random() * types.length)];
    }
}