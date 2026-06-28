export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = { x: 0, y: 0 };
        this.gridSize = 40;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    clear() {
        this.ctx.fillStyle = '#111118';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateCamera(player) {
        this.camera.x = player.x - this.canvas.width / 2;
        this.camera.y = player.y - this.canvas.height / 2;
    }

    drawGrid() {
        const ctx = this.ctx;
        const startX = Math.floor(this.camera.x / this.gridSize) * this.gridSize;
        const startY = Math.floor(this.camera.y / this.gridSize) * this.gridSize;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Вертикальные линии
        for (let x = startX; x < this.camera.x + this.canvas.width + this.gridSize; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, this.camera.y);
            ctx.lineTo(x, this.camera.y + this.canvas.height + this.gridSize);
            ctx.stroke();
        }
        
        // Горизонтальные линии
        for (let y = startY; y < this.camera.y + this.canvas.height + this.gridSize; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(this.camera.x, y);
            ctx.lineTo(this.camera.x + this.canvas.width + this.gridSize, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawPlayer(player) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Свечение
        const glow = ctx.createRadialGradient(
            player.x, player.y, player.radius * 0.5,
            player.x, player.y, player.radius * 3
        );
        glow.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
        glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Мерцание при неуязвимости
        if (player.isInvincible() && Math.floor(player.invincibleTimer * 20) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }
        
        // Тело игрока
        const gradient = ctx.createRadialGradient(
            player.x - 2, player.y - 2, 2,
            player.x, player.y, player.radius
        );
        gradient.addColorStop(0, '#c084fc');
        gradient.addColorStop(1, '#7c3aed');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.globalAlpha = 1;
        
        // Направление взгляда
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(
            player.x + player.facingX * player.radius,
            player.y + player.facingY * player.radius
        );
        ctx.stroke();
        
        ctx.restore();
    }

    drawEnemies(enemies) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        enemies.forEach(enemy => {
            // Хит-флеш
            if (enemy.hitFlash > 0) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = enemy.color;
            }
            
            // Тело врага
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Обводка
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // HP бар
            if (enemy.hp < enemy.maxHp) {
                const barWidth = enemy.radius * 2;
                const barHeight = 3;
                const barY = enemy.y - enemy.radius - 8;
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);
                
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(
                    enemy.x - barWidth / 2,
                    barY,
                    barWidth * (enemy.hp / enemy.maxHp),
                    barHeight
                );
            }
            
            // Метка босса
            if (enemy.type === 'boss') {
                ctx.font = 'bold 12px Inter';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText('BOSS', enemy.x, enemy.y - enemy.radius - 16);
            }
        });
        
        ctx.restore();
    }

    drawProjectiles(projectiles) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        projectiles.forEach(projectile => {
            ctx.fillStyle = projectile.color;
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Свечение
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    drawEffects(effects) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        effects.forEach(effect => {
            ctx.globalAlpha = effect.life / effect.maxLife;
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 3 * (effect.life / effect.maxLife), 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawFloatingTexts(texts) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        texts.forEach(text => {
            ctx.globalAlpha = text.life / text.maxLife;
            ctx.fillStyle = text.color;
            ctx.font = 'bold 13px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(text.text, text.x, text.y);
        });
        
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}