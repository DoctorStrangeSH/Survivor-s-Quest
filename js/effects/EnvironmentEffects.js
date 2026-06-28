export class EnvironmentEffects {
    constructor() {
        this.floatingTexts = [];
        this.screenShake = { intensity: 0, duration: 0 };
        this.flash = { alpha: 0, color: '#ffffff', duration: 0 };
        this.vignette = true;
        this.screenShakeEnabled = true;
    }

    addFloatingText(x, y, text, color = '#ffffff', size = 14) {
        this.floatingTexts.push({ x, y, text, color, size, life: 1, maxLife: 1, vy: -50 });
    }

    showBootstrapNotification(title, message, type = 'success') {
        const colors = {
            success: { bg: '#22c55e', icon: '✅' },
            warning: { bg: '#fbbf24', icon: '⚠️' },
            danger: { bg: '#ef4444', icon: '❌' },
            info: { bg: '#7c3aed', icon: 'ℹ️' },
            achievement: { bg: '#fbbf24', icon: '🏆' }
        };
        
        const config = colors[type] || colors.info;
        
        const notif = document.createElement('div');
        notif.className = 'game-notification';
        notif.innerHTML = `
            <span style="font-size: 20px;">${config.icon}</span>
            <div style="font-weight: 700; font-size: 13px; margin-top: 3px;">${title}</div>
            <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">${message}</div>
        `;
        
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    shakeScreen(intensity = 5, duration = 0.2) {
        if (!this.screenShakeEnabled) return;
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }

    flashScreen(color = '#ff0000', duration = 0.15) {
        this.flash.alpha = 0.4;
        this.flash.color = color;
        this.flash.duration = duration;
    }

    update(dt) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const text = this.floatingTexts[i];
            text.y += text.vy * dt;
            text.life -= dt;
            if (text.life <= 0) this.floatingTexts.splice(i, 1);
        }
        
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= dt;
            if (this.screenShake.duration <= 0) {
                this.screenShake.intensity = 0;
                this.screenShake.duration = 0;
            } else {
                this.screenShake.intensity *= 0.85;
            }
        }
        
        if (this.flash.duration > 0) {
            this.flash.duration -= dt;
            this.flash.alpha -= dt * 3;
            if (this.flash.duration <= 0 || this.flash.alpha <= 0) {
                this.flash.alpha = 0;
                this.flash.duration = 0;
            }
        } else {
            this.flash.alpha = 0;
        }
    }

    draw(ctx, canvas) {
        this.floatingTexts.forEach(text => {
            const alpha = text.life / text.maxLife;
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${text.size}px "Inter", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillText(text.text, text.x + 1, text.y + 1);
            ctx.fillStyle = text.color;
            ctx.fillText(text.text, text.x, text.y);
        });
        
        if (this.flash.alpha > 0.01) {
            ctx.globalAlpha = this.flash.alpha;
            ctx.fillStyle = this.flash.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        if (this.vignette) {
            const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.4, canvas.width/2, canvas.height/2, canvas.width*0.8);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
            ctx.globalAlpha = 1;
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.globalAlpha = 1;
    }

    applyShake(x, y) {
        if (this.screenShake.duration > 0 && this.screenShakeEnabled) {
            return { x: x + (Math.random()-0.5)*this.screenShake.intensity*2, y: y + (Math.random()-0.5)*this.screenShake.intensity*2 };
        }
        return { x, y };
    }
}