export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tileSize = 64;
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
        // Смещение для параллакса
        const offsetX = player.x % this.tileSize;
        const offsetY = player.y % this.tileSize;
        
        this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        this.ctx.lineWidth = 1;
        
        for (let x = -offsetX; x < this.canvas.width; x += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = -offsetY; y < this.canvas.height; y += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawPlayer(player) {
        const ctx = this.ctx;
        const screenX = this.canvas.width / 2;
        const screenY = this.canvas.height / 2;
        
        // Игрок всегда в центре экрана
        ctx.save();
        ctx.translate(screenX, screenY);
        
        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Тело
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Глаза
        const ex = player.facing.x * 5;
        const ey = player.facing.y * 5;
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ex - 3, ey - 2, 3, 0, Math.PI * 2);
        ctx.arc(ex + 3, ey - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(ex - 2, ey - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(ex + 4, ey - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    drawEnemies(enemies, player) {
        const ctx = this.ctx;
        const offsetX = this.canvas.width / 2 - player.x;
        const offsetY = this.canvas.height / 2 - player.y;
        
        enemies.forEach(enemy => {
            const x = enemy.x + offsetX;
            const y = enemy.y + offsetY;
            
            // Проверка видимости
            if (x < -50 || x > this.canvas.width + 50 || y < -50 || y > this.canvas.height + 50) return;
            
            // Тень
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(x, y + enemy.radius * 0.6, enemy.radius, enemy.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Тело
            ctx.fillStyle = enemy.hitFlash > 0 ? '#fff' : enemy.color;
            ctx.beginPath();
            ctx.arc(x, y, enemy.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // HP бар
            if (enemy.hp < enemy.maxHp) {
                const w = enemy.radius * 2;
                const h = 3;
                ctx.fillStyle = '#000';
                ctx.fillRect(x - w/2, y - enemy.radius - 8, w, h);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x - w/2, y - enemy.radius - 8, w * (enemy.hp/enemy.maxHp), h);
            }
        });
    }

    drawWeaponEffects(weaponSystem, player) {
        const ctx = this.ctx;
        const ox = this.canvas.width / 2 - player.x;
        const oy = this.canvas.height / 2 - player.y;
        
        // Снаряды
        weaponSystem.projectiles.forEach(p => {
            const x = p.x + ox;
            const y = p.y + oy;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawPickups(pickups, player) {
        const ctx = this.ctx;
        const ox = this.canvas.width / 2 - player.x;
        const oy = this.canvas.height / 2 - player.y;
        
        pickups.forEach(p => {
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(p.x + ox, p.y + oy, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawUI(game, player) {
        const ctx = this.ctx;
        
        // Верхняя панель
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, this.canvas.width, 40);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Inter';
        ctx.textAlign = 'left';
        
        ctx.fillText(`HP: ${Math.ceil(player.hp)}/${player.maxHp}`, 20, 27);
        ctx.fillText(`Level: ${player.level}`, 180, 27);
        ctx.fillText(`Exp: ${player.exp}/${player.expToNext}`, 300, 27);
        ctx.fillText(`Wave: ${game.waveSystem.getWave()}`, 460, 27);
        ctx.fillText(`Time: ${Math.floor(game.gameTime)}s`, 580, 27);
    }
}