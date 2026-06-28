export class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameTime = 0;
        this.frames = 0;
        this.timer = 0;
        this.metrics = { enemies: 0, projectiles: 0, particles: 0, drawCalls: 0 };
        this.qualityLevel = 'high';
        this.autoQuality = true;
    }

    update(dt) {
        this.frames++;
        this.timer += dt;
        if (this.timer >= 1) {
            this.fps = Math.round(this.frames / this.timer);
            this.frameTime = (this.timer / this.frames) * 1000;
            this.frames = 0;
            this.timer = 0;
            if (this.autoQuality) this.adjustQuality();
        }
    }

    adjustQuality() {
        if (this.fps < 30) this.setQuality('low');
        else if (this.fps < 50) this.setQuality('medium');
        else if (this.fps > 55) this.setQuality('high');
    }

    setQuality(level) {
        if (this.qualityLevel === level) return;
        this.qualityLevel = level;
        
        if (window.game?.renderer) {
            const r = window.game.renderer;
            switch(level) {
                case 'low':
                    r.qualitySettings.particles = false;
                    r.qualitySettings.shadows = false;
                    r.qualitySettings.glow = false;
                    break;
                case 'medium':
                    r.qualitySettings.particles = true;
                    r.qualitySettings.shadows = false;
                    r.qualitySettings.glow = true;
                    break;
                case 'high':
                    r.qualitySettings.particles = true;
                    r.qualitySettings.shadows = true;
                    r.qualitySettings.glow = true;
                    break;
            }
        }
    }

    drawFPS(ctx) {
        // Bootstrap-стиль FPS счетчика
        const x = 10, y = 10;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.roundRect(ctx, x, y, 100, 30, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(124,58,237,0.5)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, x, y, 100, 30, 6);
        ctx.stroke();
        
        ctx.fillStyle = this.fps >= 50 ? '#4ade80' : this.fps >= 30 ? '#fbbf24' : '#ef4444';
        ctx.font = 'bold 11px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${this.fps}`, x + 8, y + 14);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Q: ${this.qualityLevel}`, x + 8, y + 26);
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
        ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.closePath();
    }
}