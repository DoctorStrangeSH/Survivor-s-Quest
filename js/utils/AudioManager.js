import { eventBus } from '../core/EventBus.js';

export class AudioManager {
    constructor() {
        this.audioCtx = null;
        this.enabled = true;
        this.volume = 0.1;
        
        // Звуковые эффекты
        this.sounds = {
            hit: { freq: 200, duration: 0.1, type: 'square', vol: 0.08 },
            kill: { freq: [400, 600], duration: [0.15, 0.1], type: 'square', vol: [0.1, 0.08] },
            levelup: { freq: [523, 659, 784, 1047], duration: 0.15, type: 'square', vol: 0.12 },
            explosion: { freq: 80, duration: 0.4, type: 'sawtooth', vol: 0.15 },
            freeze: { freq: 1000, duration: 0.3, type: 'sine', vol: 0.1 },
            heal: { freq: [600, 800], duration: 0.2, type: 'sine', vol: 0.1 },
            boss: { freq: 60, duration: 0.8, type: 'sawtooth', vol: 0.2 },
            buy: { freq: [800, 1000], duration: 0.1, type: 'square', vol: 0.1 }
        };
        
        this.setupEvents();
    }

    setupEvents() {
        eventBus.on('sound:play', (soundName) => {
            this.play(soundName);
        });
        
        // Инициализация аудиоконтекста при первом взаимодействии
        const initAudio = () => {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        };
        
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });
    }

    play(soundName) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (!sound) return;
        
        // Если частота - массив, проигрываем последовательность
        if (Array.isArray(sound.freq)) {
            sound.freq.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(
                        freq,
                        Array.isArray(sound.duration) ? sound.duration[index] : sound.duration,
                        sound.type,
                        Array.isArray(sound.vol) ? sound.vol[index] : sound.vol
                    );
                }, index * 80);
            });
        } else {
            this.playTone(sound.freq, sound.duration, sound.type, sound.vol);
        }
    }

    playTone(freq, duration, type = 'square', vol = 0.1) {
        if (!this.audioCtx) return;
        
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(vol * this.volume, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            this.audioCtx.currentTime + duration
        );
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + duration);
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}