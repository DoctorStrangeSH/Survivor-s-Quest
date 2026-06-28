export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = { x: 0, y: 0 };
        this.gridSize = 40;
        
        // Кэш для градиентов
        this.gradientCache = new Map();
        
        // Полифилл для roundRect
        if (!ctx.roundRect) {
            ctx.roundRect = function(x, y, w, h, r) {
                if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
                
                ctx.beginPath();
                ctx.moveTo(x + r.tl, y);
                ctx.lineTo(x + w - r.tr, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
                ctx.lineTo(x + w, y + h - r.br);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
                ctx.lineTo(x + r.bl, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
                ctx.lineTo(x, y + r.tl);
                ctx.quadraticCurveTo(x, y, x + r.tl, y);
                ctx.closePath();
            };
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gradientCache.clear(); // Очищаем кэш при ресайзе
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
        
        // Свечение игрока
        const glowKey = `glow_${player.radius}`;
        let glow = this.gradientCache.get(glowKey);
        
        if (!glow) {
            glow = ctx.createRadialGradient(0, 0, player.radius * 0.5, 0, 0, player.radius * 3);
            glow.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
            glow.addColorStop(0.5, 'rgba(168, 85, 247, 0.2)');
            glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
            this.gradientCache.set(glowKey, glow);
        }
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Мерцание при неуязвимости
        if (player.isInvincible() && Math.floor(player.invincibleTimer * 20) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }
        
        // Тень игрока
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        ctx.shadowBlur = 15;
        
        // Тело игрока
        const bodyGradient = ctx.createRadialGradient(
            player.x - 2, player.y - 2, 2,
            player.x, player.y, player.radius
        );
        bodyGradient.addColorStop(0, '#c084fc');
        bodyGradient.addColorStop(0.7, '#9333ea');
        bodyGradient.addColorStop(1, '#7c3aed');
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 0;
        ctx.stroke();
        
        ctx.globalAlpha = 1;
        
        // Направление взгляда (глаза)
        const eyeOffsetX = player.facingX * player.radius * 0.4;
        const eyeOffsetY = player.facingY * player.radius * 0.4;
        
        // Левый глаз
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
            player.x + eyeOffsetX - 3, 
            player.y + eyeOffsetY - 3, 
            3, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Правый глаз
        ctx.beginPath();
        ctx.arc(
            player.x + eyeOffsetX + 3, 
            player.y + eyeOffsetY - 3, 
            3, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Зрачки
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(
            player.x + eyeOffsetX - 2, 
            player.y + eyeOffsetY - 3, 
            1.5, 0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
            player.x + eyeOffsetX + 4, 
            player.y + eyeOffsetY - 3, 
            1.5, 0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }

    drawEnemies(enemies) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        enemies.forEach(enemy => {
            // Сохраняем контекст для каждого врага
            ctx.save();
            
            // Тень
            ctx.shadowColor = enemy.color;
            ctx.shadowBlur = enemy.type === 'boss' ? 20 : 5;
            
            // Хит-флеш эффект
            if (enemy.hitFlash > 0) {
                const flashIntensity = enemy.hitFlash / 0.15;
                ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
                
                // Свечение при попадании
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 20;
            } else {
                ctx.fillStyle = enemy.color;
            }
            
            // Тело врага
            ctx.beginPath();
            
            // Разные формы для разных типов врагов
            if (enemy.type === 'bat') {
                // Летучая мышь - овальная форма
                ctx.ellipse(enemy.x, enemy.y, enemy.radius, enemy.radius * 0.7, 0, 0, Math.PI * 2);
            } else if (enemy.type === 'boss') {
                // Босс - форма звезды
                this.drawStar(ctx, enemy.x, enemy.y, enemy.radius, enemy.radius * 0.5, 5);
            } else {
                // Обычные враги - круг
                ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            }
            
            ctx.fill();
            
            // Обводка
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = enemy.type === 'boss' ? 3 : 1.5;
            ctx.shadowBlur = 0;
            ctx.stroke();
            
            // HP бар
            if (enemy.hp < enemy.maxHp) {
                const barWidth = enemy.radius * 2;
                const barHeight = enemy.type === 'boss' ? 5 : 3;
                const barY = enemy.y - enemy.radius - 10;
                
                // Фон бара
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);
                
                // Заполнение бара
                const healthPercent = enemy.hp / enemy.maxHp;
                const barColor = healthPercent > 0.5 ? '#4ade80' : 
                                healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
                
                ctx.fillStyle = barColor;
                ctx.fillRect(
                    enemy.x - barWidth / 2,
                    barY,
                    barWidth * healthPercent,
                    barHeight
                );
                
                // Текст HP для босса
                if (enemy.type === 'boss') {
                    ctx.font = 'bold 10px Inter';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        `${Math.ceil(enemy.hp)}/${enemy.maxHp}`,
                        enemy.x,
                        barY - 5
                    );
                }
            }
            
            // Метка босса
            if (enemy.type === 'boss') {
                ctx.font = 'bold 14px "Press Start 2P", monospace';
                ctx.fillStyle = '#ef4444';
                ctx.textAlign = 'center';
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 10;
                ctx.fillText('BOSS', enemy.x, enemy.y - enemy.radius - 25);
                ctx.shadowBlur = 0;
            }
            
            // Эффект заморозки
            if (enemy.effects?.frozen) {
                ctx.strokeStyle = 'rgba(103, 232, 249, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius + 3, 0, Math.PI * 2);
                ctx.stroke();
                
                // Кристаллы льда
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI * 2 * i) / 4 + Date.now() * 0.001;
                    const dist = enemy.radius + 6;
                    ctx.fillStyle = 'rgba(103, 232, 249, 0.8)';
                    ctx.beginPath();
                    ctx.arc(
                        enemy.x + Math.cos(angle) * dist,
                        enemy.y + Math.sin(angle) * dist,
                        2, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
            
            // Эффект горения
            if (enemy.burning) {
                const burnIntensity = enemy.burning.timer / 2;
                ctx.fillStyle = `rgba(255, 100, 50, ${burnIntensity * 0.3})`;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius + 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    drawStar(ctx, cx, cy, outerRadius, innerRadius, points) {
        const step = Math.PI / points;
        let angle = -Math.PI / 2;
        
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * outerRadius, cy + Math.sin(angle) * outerRadius);
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? innerRadius : outerRadius;
            angle += step;
            ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        }
        
        ctx.closePath();
    }

    drawProjectiles(projectiles) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        projectiles.forEach(projectile => {
            // Свечение снаряда
            ctx.shadowColor = projectile.color;
            ctx.shadowBlur = 8;
            
            // Основной снаряд
            ctx.fillStyle = projectile.color;
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius || 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ядро снаряда
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, (projectile.radius || 4) * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Хвост снаряда
            if (projectile.vx && projectile.vy) {
                const speed = Math.hypot(projectile.vx, projectile.vy);
                if (speed > 0) {
                    const trailLength = 8;
                    const nx = -projectile.vx / speed;
                    const ny = -projectile.vy / speed;
                    
                    ctx.strokeStyle = projectile.color;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(projectile.x, projectile.y);
                    ctx.lineTo(
                        projectile.x + nx * trailLength,
                        projectile.y + ny * trailLength
                    );
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        });
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawEffects(effects) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        effects.forEach(effect => {
            const alpha = effect.life / effect.maxLife;
            ctx.globalAlpha = alpha;
            
            // Свечение
            ctx.shadowColor = effect.color;
            ctx.shadowBlur = 5;
            
            // Размер зависит от оставшегося времени жизни
            const size = 3 * alpha;
            
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Яркое ядро
            if (alpha > 0.5) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawFloatingTexts(texts) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        texts.forEach(text => {
            const alpha = text.life / text.maxLife;
            ctx.globalAlpha = alpha;
            
            // Тень текста
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(text.text, text.x + 1, text.y + 1);
            
            // Основной текст
            ctx.fillStyle = text.color;
            ctx.fillText(text.text, text.x, text.y);
        });
        
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawAttackRange(player, range) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Пульсирующий круг радиуса атаки
        const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.05;
        
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = Date.now() * 0.05;
        
        ctx.beginPath();
        ctx.arc(player.x, player.y, range * pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.restore();
    }

    drawLightningSegments(segments) {
        if (!segments || segments.length === 0) return;
        
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        segments.forEach(lightning => {
            if (lightning.segments.length < 2) return;
            
            const alpha = lightning.life / lightning.maxLife;
            
            // Внешнее свечение
            ctx.strokeStyle = lightning.color;
            ctx.lineWidth = 6 * alpha;
            ctx.globalAlpha = alpha * 0.3;
            ctx.shadowColor = lightning.color;
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y);
            
            for (let i = 1; i < lightning.segments.length; i++) {
                ctx.lineTo(lightning.segments[i].x, lightning.segments[i].y);
            }
            
            ctx.stroke();
            
            // Основная линия молнии
            ctx.strokeStyle = lightning.color;
            ctx.lineWidth = 3 * alpha;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y);
            
            for (let i = 1; i < lightning.segments.length; i++) {
                ctx.lineTo(lightning.segments[i].x, lightning.segments[i].y);
            }
            
            ctx.stroke();
            
            // Белая сердцевина молнии
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5 * alpha;
            ctx.globalAlpha = alpha * 0.8;
            ctx.shadowBlur = 5;
            
            ctx.beginPath();
            ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y);
            
            for (let i = 1; i < lightning.segments.length; i++) {
                ctx.lineTo(lightning.segments[i].x, lightning.segments[i].y);
            }
            
            ctx.stroke();
            
            // Точки соединения
            lightning.segments.forEach((point, index) => {
                if (index === 0 || index === lightning.segments.length - 1) {
                    ctx.fillStyle = '#ffffff';
                    ctx.globalAlpha = alpha;
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawAuraParticles(player, particles) {
        if (!particles || particles.length === 0) return;
        
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        const time = Date.now() * 0.001;
        
        // Основное свечение ауры
        const gradient = ctx.createRadialGradient(
            player.x, player.y, player.radius * 0.5,
            player.x, player.y, 75
        );
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.1)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 75, 0, Math.PI * 2);
        ctx.fill();
        
        // Внешнее кольцо ауры
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 70, 0, Math.PI * 2);
        ctx.stroke();
        
        // Частицы ауры
        particles.forEach(particle => {
            const alpha = 0.4 + Math.sin(time * 3 + particle.distance * 0.1) * 0.2;
            
            // Свечение частицы
            ctx.shadowColor = '#c084fc';
            ctx.shadowBlur = 6;
            ctx.globalAlpha = alpha * 0.5;
            
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Ядро частицы
            ctx.shadowBlur = 3;
            ctx.globalAlpha = alpha;
            
            ctx.fillStyle = '#e9d5ff';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            // Белая точка в центре
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawBossWarning(boss) {
        if (!boss) return;
        
        const ctx = this.ctx;
        const time = Date.now() * 0.001;
        const alpha = 0.3 + Math.sin(time * 3) * 0.2;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Красная зона вокруг босса
        ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = time * 50;
        
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, boss.radius * 2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.restore();
    }

    // Дополнительный метод для отладки
    drawDebugInfo(info) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        
        let y = 60;
        Object.entries(info).forEach(([key, value]) => {
            ctx.fillText(`${key}: ${value}`, 10, y);
            y += 16;
        });
        
        ctx.restore();
    }
}