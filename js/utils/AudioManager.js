export class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.3;
        this.sounds = {};
        this.initOnInteraction();
    }

    initOnInteraction() {
        const init = () => {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
        };
        
        document.addEventListener('click', init, { once: true });
        document.addEventListener('keydown', init, { once: true });
        document.addEventListener('touchstart', init, { once: true });
    }

    play(name) {
        if (!this.enabled || !this.ctx) return;
        
        const sounds = {
            hit: { freq: 200, duration: 0.1, type: 'square' },
            kill: { freq: [400, 600], duration: [0.1, 0.08], type: 'square' },
            levelup: { freq: [523, 659, 784], duration: 0.1, type: 'sine' },
            pickup: { freq: 800, duration: 0.1, type: 'sine' },
            damage: { freq: 100, duration: 0.2, type: 'sawtooth' },
            death: { freq: [300, 200, 100], duration: [0.2, 0.2, 0.4], type: 'sawtooth' },
            boss: { freq: 50, duration: 0.5, type: 'sawtooth' },
            evolution: { freq: [600, 800, 1000], duration: 0.15, type: 'sine' }
        };
        
        const sound = sounds[name];
        if (!sound) return;
        
        if (Array.isArray(sound.freq)) {
            sound.freq.forEach((freq, i) => {
                setTimeout(() => {
                    this.playTone(freq, 
                        Array.isArray(sound.duration) ? sound.duration[i] : sound.duration,
                        sound.type);
                }, i * 80);
            });
        } else {
            this.playTone(sound.freq, sound.duration, sound.type);
        }
    }

    playTone(freq, duration, type) {
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}