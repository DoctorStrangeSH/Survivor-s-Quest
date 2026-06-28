export class WeaponEffects {
    constructor() {
        this.trails = [];
        this.impacts = [];
        this.beams = [];
    }

    // След за снарядом
    addTrail(x, y, vx, vy, color, life = 0.3) {
        this.trails.push({
            x, y,
            vx: -vx * 0.3,
            vy: -vy * 0.3,
            life,
            maxLife: life,
            color,
            size: 2
        });
    }

    // Эффект попадания
    addImpact(x, y, color, size = 8) {
        this.impacts.push({
            x, y,
            radius: 0,
            maxRadius: size,
            life: 0.2,
            maxLife: 0.2,
            color
        });
    }

    // Луч (для молнии)
    addBeam(x1, y1, x2, y2, color, life = 0.1) {
        this.beams.push({
            x1, y1, x2, y2,
            life,
            maxLife: life,
            color,
            segments: this.generateBeamSegments(x1, y1, x2, y2)
        });
    }

    generateBeamSegments(x1, y1, x2, y2) {
        const segments = [{ x: x1, y: y1 }];
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const count = Math.floor(dist / 10);
        
        for (let i = 1; i < count; i++) {
            const t = i / count;
            const offset = (Math.random() - 0.5) * 15;
            segments.push({
                x: x1 + (x2 - x1) * t + offset,
                y: y1 + (y2 - y1) * t + offset
            });
        }
        
        segments.push({ x: x2, y: y2 });
        return segments;
    }

    update(dt) {
        // Обновление следов
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.x += trail.vx * dt;
            trail.y += trail.vy * dt;
            trail.life -= dt;
            
            if (trail.life <= 0) {
                this.trails.splice(i, 1);
            }
        }
        
        // Обновление попаданий
        for (let i = this.impacts.length - 1; i >= 0; i--) {
            const impact = this.impacts[i];
            impact.life -= dt;
            impact.radius = impact.maxRadius * (1 - impact.life / impact.maxLife);
            
            if (impact.life <= 0) {
                this.impacts.splice(i, 1);
            }
        }
        
        // Обновление лучей
        for (let i = this.beams.length - 1; i >= 0; i--) {
            const beam = this.beams[i];
            beam.life -= dt;
            
            if (beam.life <= 0) {
                this.beams.splice(i, 1);
            }
        }
    }

    draw(ctx, player, canvas) {
        // Отрисовка следов
        this.trails.forEach(trail => {
            const alpha = trail.life / trail.maxLife;
            const sx = canvas.width / 2 + (trail.x - player.x);
            const sy = canvas.height / 2 + (trail.y - player.y);
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = trail.color;
            ctx.beginPath();
            ctx.arc(sx, sy, trail.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Отрисовка попаданий
        this.impacts.forEach(impact => {
            const alpha = impact.life / impact.maxLife;
            const sx = canvas.width / 2 + (impact.x - player.x);
            const sy = canvas.height / 2 + (impact.y - player.y);
            
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = impact.color;
            ctx.lineWidth = 2 * alpha;
            ctx.beginPath();
            ctx.arc(sx, sy, impact.radius, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // Отрисовка лучей
        this.beams.forEach(beam => {
            if (beam.segments.length < 2) return;
            
            const alpha = beam.life / beam.maxLife;
            const sx1 = canvas.width / 2 + (beam.x1 - player.x);
            const sy1 = canvas.height / 2 + (beam.y1 - player.y);
            
            ctx.globalAlpha = alpha * 0.7;
            ctx.strokeStyle = beam.color;
            ctx.lineWidth = 3;
            ctx.shadowColor = beam.color;
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            
            beam.segments.forEach(seg => {
                const sx = canvas.width / 2 + (seg.x - player.x);
                const sy = canvas.height / 2 + (seg.y - player.y);
                ctx.lineTo(sx, sy);
            });
            
            ctx.stroke();
            
            // Белая сердцевина
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            
            beam.segments.forEach(seg => {
                const sx = canvas.width / 2 + (seg.x - player.x);
                const sy = canvas.height / 2 + (seg.y - player.y);
                ctx.lineTo(sx, sy);
            });
            
            ctx.stroke();
        });
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}