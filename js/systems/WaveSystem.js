import { eventBus } from '../core/EventBus.js';

export class WaveSystem {
    constructor(enemySystem) {
        this.enemySystem = enemySystem;
        this.wave = 1;
        this.waveTimer = 0;
        this.waveDuration = 30; // 30 секунд на волну
        this.betweenWaveTimer = 0;
        this.betweenWaveDuration = 5; // 5 секунд между волнами
        this.isBetweenWaves = false;
        this.bossActive = false;
    }

    reset() {
        this.wave = 1;
        this.waveTimer = 0;
        this.betweenWaveTimer = 0;
        this.isBetweenWaves = false;
        this.bossActive = false;
    }

    update(dt) {
        if (this.isBetweenWaves) {
            this.betweenWaveTimer -= dt;
            if (this.betweenWaveTimer <= 0) {
                this.startNewWave();
            }
            return;
        }
        
        this.waveTimer += dt;
        
        // Обновление сложности волны
        this.updateDifficulty();
        
        // Проверка окончания волны
        if (this.waveTimer >= this.waveDuration) {
            this.endWave();
        }
        
        // Спавн босса каждые 5 волн
        if (this.wave % 5 === 0 && !this.bossActive && this.waveTimer > 5) {
            this.spawnBoss();
        }
    }

    updateDifficulty() {
        // Увеличиваем скорость спавна с каждой волной
        const spawnInterval = Math.max(0.2, 1.5 - (this.wave - 1) * 0.1);
        this.enemySystem.setSpawnInterval(spawnInterval);
    }

    startNewWave() {
        this.isBetweenWaves = false;
        this.waveTimer = 0;
        this.waveDuration = 30 + this.wave * 2;
        this.bossActive = false;
        
        eventBus.emit('wave:started', this.wave);
        
        // Бонус за начало волны
        eventBus.emit('player:waveBonus', {
            heal: 15 + this.wave * 2,
            wave: this.wave
        });
    }

    endWave() {
        this.isBetweenWaves = true;
        this.betweenWaveTimer = this.betweenWaveDuration;
        
        eventBus.emit('wave:ended', this.wave);
        
        // Награда за завершение волны
        eventBus.emit('player:waveReward', {
            gold: 10 + this.wave * 5,
            exp: 20 + this.wave * 10,
            wave: this.wave
        });
        
        this.wave++;
    }

    spawnBoss() {
        this.bossActive = true;
        const player = window.Game?.player;
        if (player) {
            const boss = this.enemySystem.spawnBoss(player);
            eventBus.emit('wave:bossSpawned', boss);
        }
    }

    getWaveNumber() {
        return this.wave;
    }

    getTimeUntilNextWave() {
        if (this.isBetweenWaves) {
            return this.betweenWaveTimer;
        }
        return this.waveDuration - this.waveTimer;
    }
}