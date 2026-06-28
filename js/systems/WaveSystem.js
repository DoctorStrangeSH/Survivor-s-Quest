export class WaveSystem {
    constructor() {
        this.wave = 1;
        this.timer = 0;
        this.enemiesPerWave = [10, 15, 20, 25, 30];
    }

    update(dt, gameTime) {
        this.timer += dt;
        
        // Новая волна каждые 30 секунд
        if (this.timer >= 30) {
            this.wave++;
            this.timer = 0;
        }
    }

    getWave() {
        return this.wave;
    }

    getSpawnInterval() {
        return Math.max(0.2, 2 - this.wave * 0.1);
    }

    getEnemyType() {
        const types = ['bat'];
        
        if (this.wave >= 2) types.push('skeleton');
        if (this.wave >= 3) types.push('zombie');
        if (this.wave >= 5) types.push('ghost');
        if (this.wave >= 8) types.push('golem');
        
        // Босс каждые 5 волн
        if (this.wave % 5 === 0 && Math.random() < 0.1) {
            return 'boss';
        }
        
        return types[Math.floor(Math.random() * types.length)];
    }
}