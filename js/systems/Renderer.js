import { CharacterSprites } from '../entities/CharacterSprites.js';
import { EnemySprites } from '../entities/EnemySprites.js';

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
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = -ox; x < this.canvas.width + this.tileSize; x += this.tileSize) {
            ctx.moveTo(x, -oy);
            ctx.lineTo(x, this.canvas.height + this.tileSize);
        }
        for (let y = -oy; y < this.canvas.height + this.tileSize; y += this.tileSize) {
            ctx.moveTo(-ox, y);
            ctx.lineTo(this.canvas.width + this.tileSize, y);
        }
        ctx.stroke();
    }

    drawPlayer(player) {
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 12, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (player.invincible > 0 && Math.floor(player.invincible * 20) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }
        
        if (player.characterType) {
            CharacterSprites.drawCharacter(ctx, cx, cy - 5, 28, player.characterType, player.facing);
        } else {
            ctx.fillStyle = player.bodyColor;
            ctx.beginPath();
            ctx.arc(cx, cy, 14, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }

    drawEnemies(enemies, player) {
        const ctx = this.ctx;
        const ox = this.canvas.width / 2 - player.x;
        const oy = this.canvas.height / 2 - player.y;
        
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const sx = enemy.x + ox;
            const sy = enemy.y + oy;
            
            if (sx < -50 || sx > this.canvas.width + 50 || sy < -50 || sy > this.canvas.height + 50) continue;
            
            const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            
            if (dist > 500) {
                ctx.fillStyle = enemy.hitFlash > 0 ? '#fff' : enemy.color;
                ctx.beginPath();
                ctx.arc(sx, sy, enemy.radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                if (enemy.radius > 10) {
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.beginPath();
                    ctx.ellipse(sx, sy + enemy.radius * 0.5, enemy.radius * 0.7, enemy.radius * 0.3, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                EnemySprites.drawEnemy(ctx, enemy, sx, sy);
                
                if (enemy.hp < enemy.maxHp && enemy.radius > 8) {
                    const bw = enemy.radius * 1.5;
                    const bh = 2;
                    const by = sy - enemy.radius - 8;
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.fillRect(sx - bw/2, by, bw, bh);
                    ctx.fillStyle = enemy.hp/enemy.maxHp > 0.5 ? '#4ade80' : enemy.hp/enemy.maxHp > 0.25 ? '#fbbf24' : '#ef4444';
                    ctx.fillRect(sx - bw/2, by, bw * (enemy.hp/enemy.maxHp), bh);
                }
            }
        }
    }

    drawPickups(pickups, player) {
        if (pickups.length === 0) return;
        const ctx = this.ctx;
        const ox = this.canvas.width / 2 - player.x;
        const oy = this.canvas.height / 2 - player.y;
        const now = Date.now();
        
        for (let i = 0; i < pickups.length; i++) {
            const p = pickups[i];
            const sx = p.x + ox;
            const sy = p.y + oy;
            if (sx < -20 || sx > this.canvas.width + 20 || sy < -20 || sy > this.canvas.height + 20) continue;
            
            const size = Math.min(20, (p.size || 5) * (1 + Math.sin(now * 0.004 + i * 0.1) * 0.15));
            
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(sx - size*0.2, sy - size*0.2, size*0.25, 0, Math.PI * 2);
            ctx.fill();
            
            if (p.count > 1 && size > 6) {
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.9;
                ctx.font = `bold ${Math.min(12,size)}px Inter`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('x'+p.count, sx, sy);
            }
        }
        ctx.globalAlpha = 1;
    }

    drawGarlicAura(player, range) {
        const ctx = this.ctx;
        const cx = this.canvas.width/2;
        const cy = this.canvas.height/2;
        ctx.strokeStyle = 'rgba(168,85,247,0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8,4]);
        ctx.beginPath();
        ctx.arc(cx, cy, range, 0, Math.PI*2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawBooks(books, player) {
        const ctx = this.ctx;
        const ox = this.canvas.width/2 - player.x;
        const oy = this.canvas.height/2 - player.y;
        ctx.fillStyle = '#6d28d9';
        for (let i = 0; i < books.length; i++) {
            const b = books[i];
            const sx = b.x + ox;
            const sy = b.y + oy;
            ctx.beginPath();
            ctx.arc(sx, sy, 8, 0, Math.PI*2);
            ctx.fill();
        }
    }

    drawHUD(game) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const p = game.player;
        
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, w, 36);
        ctx.fillStyle = 'rgba(168,85,247,0.6)';
        ctx.fillRect(0, 36, w, 2);
        
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        
        const hpP = p.hp/p.maxHp;
        ctx.fillStyle = hpP>0.5?'#4ade80':hpP>0.25?'#fbbf24':'#ef4444';
        ctx.fillText('❤️ '+Math.ceil(p.hp)+'/'+p.maxHp, 12, 26);
        ctx.fillStyle = '#fff';
        ctx.fillText('⭐ '+p.level, 180, 26);
        ctx.fillStyle = '#a855f7';
        ctx.fillText('💎 '+p.exp+'/'+p.expToNext, 270, 26);
        ctx.fillStyle = '#fff';
        ctx.fillText('🌊 '+game.getWave(), 410, 26);
        const m = Math.floor(game.gameTime/60);
        const s = Math.floor(game.gameTime%60);
        ctx.fillText('⏱ '+m+':'+s.toString().padStart(2,'0'), 500, 26);
        ctx.fillText('💀 '+p.kills, 600, 26);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('🪙 '+p.gold, 680, 26);
    }
}