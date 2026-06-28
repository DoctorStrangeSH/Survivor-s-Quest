export class BackgroundEffects {
    constructor() {
        this.stars = [];
        this.generateStars();
    }

    generateStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * 2000 - 1000,
                y: Math.random() * 2000 - 1000,
                size: Math.random() * 2,
                twinkle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 2
            });
        }
    }

    update(dt) {
        this.stars.forEach(star => {
            star.twinkle += star.speed * dt;
        });
    }

    draw(ctx, player, canvas) {
        // Параллакс-звезды
        this.stars.forEach(star => {
            const parallax = 0.1;
            const sx = (canvas.width / 2 + (star.x - player.x) * parallax) % canvas.width;
            const sy = (canvas.height / 2 + (star.y - player.y) * parallax) % canvas.height;
            
            const alpha = 0.3 + Math.sin(star.twinkle) * 0.2;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
    }
}