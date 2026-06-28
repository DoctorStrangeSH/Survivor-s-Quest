export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    // Создать взрыв
    createExplosion(x, y, color, count = 20, power = 100) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * power;
            const life = 0.3 + Math.random() * 0.5;
            
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life,
                maxLife: life,
                color,
                size: 2 + Math.random() * 4,
                gravity: true,
                fadeOut: true
            });
        }
    }

    // Создать след
    createTrail(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 30,
                vy: (Math.random() - 0.5) * 30,
                life: 0.2 + Math.random() * 0.3,
                maxLife: 0.5,
                color,
                size: 1 + Math.random() * 2,
                gravity: false,
                fadeOut: true
            });
        }
    }

    // Создать кольцо частиц
    createRing(x, y, color, count = 12, radius = 50) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            this.particles.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                vx: Math.cos(angle) * 80,
                vy: Math.sin(angle) * 80,
                life: 0.4,
                maxLife: 0.4,
                color,
                size: 3,
                gravity: false,
                fadeOut: true
            });
        }
    }

    // Создать дождь частиц
    createRain(x, y, color, count = 30, spread = 100) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * spread,
                y: y - Math.random() * 50,
                vx: (Math.random() - 0.5) * 20,
                vy: 100 + Math.random() * 200,
                life: 0.5 + Math.random() * 0.5,
                maxLife: 1,
                color,
                size: 1 + Math.random() * 2,
                gravity: true,
                fadeOut: true
            });
        }
    }

    // Создать спираль
    createSpiral(x, y, color, duration = 1) {
        const count = 20;
        const startAngle = Date.now() * 0.003;
        
        for (let i = 0; i < count; i++) {
            const angle = startAngle + (Math.PI * 2 * i) / count;
            const dist = 20 + i * 5;
            
            this.particles.push({
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                vx: Math.cos(angle) * 50,
                vy: Math.sin(angle) * 50,
                life: duration,
                maxLife: duration,
                color,
                size: 3,
                gravity: false,
                fadeOut: true
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            
            if (p.gravity) {
                p.vy += 200 * dt;
            }
            
            p.life -= dt;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx, player, canvas) {
        this.particles.forEach(p => {
            const alpha = p.fadeOut ? p.life / p.maxLife : 1;
            const sx = canvas.width / 2 + (p.x - player.x);
            const sy = canvas.height / 2 + (p.y - player.y);
            
            if (sx < -50 || sx > canvas.width + 50 || sy < -50 || sy > canvas.height + 50) return;
            
            ctx.globalAlpha = alpha;
            
            // Свечение
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 5;
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(sx, sy, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        });
        
        ctx.globalAlpha = 1;
    }
}