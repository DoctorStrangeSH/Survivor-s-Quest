export class AnimationSystem {
    constructor() {
        this.animations = [];
    }

    // Анимация получения урона
    createDamageAnimation(target) {
        this.animations.push({
            type: 'damage',
            target,
            timer: 0.3,
            maxTimer: 0.3,
            shake: true,
            shakeIntensity: 3
        });
    }

    // Анимация лечения
    createHealAnimation(target) {
        this.animations.push({
            type: 'heal',
            target,
            timer: 0.5,
            maxTimer: 0.5,
            glow: true,
            glowColor: '#4ade80'
        });
    }

    // Анимация левел-апа
    createLevelUpAnimation(x, y) {
        this.animations.push({
            type: 'levelup',
            x, y,
            timer: 1,
            maxTimer: 1,
            rings: []
        });
        
        // Создаем расширяющиеся кольца
        for (let i = 0; i < 3; i++) {
            this.animations[this.animations.length - 1].rings.push({
                radius: 0,
                maxRadius: 50 + i * 30,
                delay: i * 0.15,
                alpha: 1
            });
        }
    }

    // Анимация появления врага
    createSpawnAnimation(x, y) {
        this.animations.push({
            type: 'spawn',
            x, y,
            timer: 0.5,
            maxTimer: 0.5,
            scale: 0
        });
    }

    // Анимация смерти врага
    createDeathAnimation(x, y, color) {
        this.animations.push({
            type: 'death',
            x, y,
            color,
            timer: 0.4,
            maxTimer: 0.4,
            particles: []
        });
        
        // Создаем разлетающиеся частицы
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.animations[this.animations.length - 1].particles.push({
                x, y,
                vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100,
                life: 0.3,
                color
            });
        }
    }

    update(dt) {
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            anim.timer -= dt;
            
            if (anim.type === 'levelup') {
                anim.rings.forEach(ring => {
                    ring.delay -= dt;
                    if (ring.delay <= 0) {
                        ring.radius += 150 * dt;
                        ring.alpha -= dt;
                    }
                });
            }
            
            if (anim.type === 'spawn') {
                anim.scale = Math.min(1, anim.scale + dt * 3);
            }
            
            if (anim.type === 'death') {
                anim.particles.forEach(p => {
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.life -= dt;
                });
            }
            
            if (anim.timer <= 0) {
                this.animations.splice(i, 1);
            }
        }
    }

    draw(ctx, player, canvas) {
        this.animations.forEach(anim => {
            if (anim.type === 'levelup') {
                const sx = canvas.width / 2 + (anim.x - player.x);
                const sy = canvas.height / 2 + (anim.y - player.y);
                
                anim.rings.forEach(ring => {
                    if (ring.delay > 0) return;
                    
                    ctx.strokeStyle = `rgba(251, 191, 36, ${ring.alpha})`;
                    ctx.lineWidth = 3 * ring.alpha;
                    ctx.beginPath();
                    ctx.arc(sx, sy, ring.radius, 0, Math.PI * 2);
                    ctx.stroke();
                });
            }
            
            if (anim.type === 'death') {
                anim.particles.forEach(p => {
                    if (p.life <= 0) return;
                    const sx = canvas.width / 2 + (p.x - player.x);
                    const sy = canvas.height / 2 + (p.y - player.y);
                    
                    ctx.globalAlpha = p.life / 0.3;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 3 * p.life / 0.3, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            }
        });
    }
}