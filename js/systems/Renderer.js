export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tileSize = 50;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    clear() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid(player) {
        const ctx = this.ctx;
        const ox = player.x % this.tileSize;
        const oy = player.y % this.tileSize;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        
        for (let x = -ox; x < this.canvas.width; x += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        for (let y = -oy; y < this.canvas.height; y += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    drawPlayer(player) {
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        
        // Свечение
        const glow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 40);
        glow.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Мерцание при уроне
        if (player.invincible > 0 && Math.floor(player.invincible * 20) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }
        
        // Тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Тело
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.globalAlpha = 1;
        
        // Глаза
        const ex = player.facing.x * 5;
        const ey = player.facing.y * 5;
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx + ex - 3, cy + ey - 2, 3, 0, Math.PI * 2);
        ctx.arc(cx + ex + 3, cy + ey - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx + ex - 2, cy + ey - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + ex + 4, cy + ey - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEnemies(enemies, player) {
        const ctx = this.ctx;
        const ox = this.canvas.width / 2 - player.x;
        const oy = this.canvas.height / 2 - player.y;
        
        enemies.forEach(enemy => {
            const sx = enemy.x + ox;
            const sy = enemy.y + oy;
            
            if (sx < -50 || sx > this.canvas.width + 50 || sy < -50 || sy > this.canvas.height + 50) return;
            
            // Тень
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(sx, sy + enemy.radius * 0.6, enemy.radius, enemy.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Тело
            ctx.fillStyle = enemy.hitFlash > 0 ? '#fff' : enemy.color;
            ctx.beginPath();
            ctx.arc(sx, sy, enemy.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // HP бар
            if (enemy.hp < enemy.maxHp) {
                const bw = enemy.radius * 2;
                const bh = 3;
                ctx.fillStyle = '#000';
                ctx.fillRect(sx - bw / 2, sy - enemy.radius - 8, bw, bh);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(sx - bw / 2, sy - enemy.radius - 8, bw * (enemy.hp / enemy.maxHp), bh);
            }
        });
    }

    drawPickups(pickups, player) {
        const ctx = this.ctx;
        const ox = this.canvas.width / 2 - player.x;
        const oy = this.canvas.height / 2 - player.y;
        
        pickups.forEach(p => {
            const sx = p.x + ox;
            const sy = p.y + oy;
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(sx, sy, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}