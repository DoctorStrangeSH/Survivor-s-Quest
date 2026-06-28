export class EnemySprites {
    
    static drawBat(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Крылья
        ctx.fillStyle = color;
        ctx.beginPath();
        // Левое крыло
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-radius * 1.2, -radius * 1.2, -radius * 1.5, -radius * 0.8);
        ctx.quadraticCurveTo(-radius * 1.2, -radius * 0.2, -radius * 0.8, -radius * 0.1);
        ctx.quadraticCurveTo(-radius * 0.5, 0, 0, -radius * 0.2);
        // Правое крыло
        ctx.quadraticCurveTo(radius * 0.5, 0, radius * 0.8, -radius * 0.1);
        ctx.quadraticCurveTo(radius * 1.2, -radius * 0.2, radius * 1.5, -radius * 0.8);
        ctx.quadraticCurveTo(radius * 1.2, -radius * 1.2, 0, 0);
        ctx.fill();
        
        // Тело
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.3, radius * 0.3, radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-radius * 0.2, -radius * 0.1, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(radius * 0.2, -radius * 0.1, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawSkeleton(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело
        ctx.fillStyle = color;
        // Череп
        ctx.beginPath();
        ctx.arc(0, -radius * 0.6, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Позвоночник
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.2);
        ctx.lineTo(0, radius * 0.5);
        ctx.stroke();
        
        // Ребра
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-radius * 0.5, -radius * 0.1 + i * radius * 0.2);
            ctx.lineTo(radius * 0.5, -radius * 0.1 + i * radius * 0.2);
            ctx.stroke();
        }
        
        // Руки
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.1);
        ctx.lineTo(-radius * 0.7, radius * 0.2);
        ctx.moveTo(0, -radius * 0.1);
        ctx.lineTo(radius * 0.7, radius * 0.2);
        ctx.stroke();
        
        // Ноги
        ctx.beginPath();
        ctx.moveTo(0, radius * 0.5);
        ctx.lineTo(-radius * 0.4, radius * 0.9);
        ctx.moveTo(0, radius * 0.5);
        ctx.lineTo(radius * 0.4, radius * 0.9);
        ctx.stroke();
        
        // Глаза
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-radius * 0.15, -radius * 0.65, radius * 0.1, 0, Math.PI * 2);
        ctx.arc(radius * 0.15, -radius * 0.65, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawZombie(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#7a9e7e';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.7, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Руки (вытянуты вперед)
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, -radius * 0.1);
        ctx.lineTo(-radius * 0.8, -radius * 0.4);
        ctx.moveTo(radius * 0.3, -radius * 0.1);
        ctx.lineTo(radius * 0.8, -radius * 0.4);
        ctx.stroke();
        
        // Глаза
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-radius * 0.12, -radius * 0.75, radius * 0.08, 0, Math.PI * 2);
        ctx.arc(radius * 0.12, -radius * 0.75, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Рот
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.6, radius * 0.12, radius * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawGhost(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело призрака
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(0, -radius * 0.3, radius * 0.5, Math.PI, 0);
        // Волнистый низ
        const waveCount = 3;
        for (let i = 0; i < waveCount; i++) {
            const wx = radius * 0.4 * Math.cos((i / waveCount) * Math.PI);
            const wy = radius * 0.3 + Math.abs(Math.sin(i * 2)) * radius * 0.2;
            ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Глаза
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.2, -radius * 0.4, radius * 0.12, radius * 0.18, 0, 0, Math.PI * 2);
        ctx.ellipse(radius * 0.2, -radius * 0.4, radius * 0.12, radius * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Рот
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.15, radius * 0.1, radius * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawGolem(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело (квадратное)
        ctx.fillStyle = color;
        ctx.beginPath();
        this.roundRect(ctx, -radius * 0.5, -radius * 0.3, radius, radius * 0.8, radius * 0.1);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#713f12';
        ctx.beginPath();
        this.roundRect(ctx, -radius * 0.3, -radius * 0.7, radius * 0.6, radius * 0.5, radius * 0.1);
        ctx.fill();
        
        // Глаза (светящиеся)
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(-radius * 0.15, -radius * 0.55, radius * 0.08, 0, Math.PI * 2);
        ctx.arc(radius * 0.15, -radius * 0.55, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Руки
        ctx.fillStyle = color;
        ctx.fillRect(-radius * 0.7, -radius * 0.2, radius * 0.2, radius * 0.4);
        ctx.fillRect(radius * 0.5, -radius * 0.2, radius * 0.2, radius * 0.4);
        
        // Ноги
        ctx.fillRect(-radius * 0.3, radius * 0.5, radius * 0.25, radius * 0.3);
        ctx.fillRect(radius * 0.05, radius * 0.5, radius * 0.25, radius * 0.3);
        
        ctx.restore();
    }

    static drawWerewolf(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.beginPath();
        ctx.arc(0, -radius * 0.6, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Уши
        ctx.beginPath();
        ctx.moveTo(-radius * 0.2, -radius * 0.8);
        ctx.lineTo(-radius * 0.35, -radius * 1.1);
        ctx.lineTo(-radius * 0.05, -radius * 0.75);
        ctx.moveTo(radius * 0.2, -radius * 0.8);
        ctx.lineTo(radius * 0.35, -radius * 1.1);
        ctx.lineTo(radius * 0.05, -radius * 0.75);
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-radius * 0.12, -radius * 0.65, radius * 0.08, 0, Math.PI * 2);
        ctx.arc(radius * 0.12, -radius * 0.65, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Когти
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i += 2) {
            for (let j = 0; j < 3; j++) {
                ctx.beginPath();
                const clawX = i * radius * 0.5;
                const clawY = radius * 0.2 + j * radius * 0.15;
                ctx.moveTo(clawX, clawY);
                ctx.lineTo(clawX + i * radius * 0.15, clawY - radius * 0.1);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }

    static drawMedusa(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.5, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Змеи вместо волос
        const snakeCount = 5;
        for (let i = 0; i < snakeCount; i++) {
            const angle = (Math.PI * 2 * i) / snakeCount - Math.PI / 2;
            const sx = Math.cos(angle) * radius * 0.3;
            const sy = -radius * 0.5 + Math.sin(angle) * radius * 0.3;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(
                sx + Math.cos(angle) * radius * 0.3,
                sy - radius * 0.3,
                sx + Math.cos(angle) * radius * 0.4,
                sy - radius * 0.5
            );
            ctx.stroke();
            
            // Глазки змей
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(sx + Math.cos(angle) * radius * 0.4, sy - radius * 0.5, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Глаза
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-radius * 0.1, -radius * 0.53, radius * 0.07, 0, Math.PI * 2);
        ctx.arc(radius * 0.1, -radius * 0.53, radius * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawVampire(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Плащ
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.moveTo(-radius * 0.6, radius * 0.1);
        ctx.quadraticCurveTo(-radius * 0.8, radius * 0.5, -radius * 0.5, radius * 0.7);
        ctx.lineTo(radius * 0.5, radius * 0.7);
        ctx.quadraticCurveTo(radius * 0.8, radius * 0.5, radius * 0.6, radius * 0.1);
        ctx.closePath();
        ctx.fill();
        
        // Тело
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, -radius * 0.1, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.5, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Волосы
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.55, radius * 0.27, Math.PI, 0);
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-radius * 0.1, -radius * 0.5, radius * 0.06, 0, Math.PI * 2);
        ctx.arc(radius * 0.1, -radius * 0.5, radius * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // Клыки
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(-radius * 0.05, -radius * 0.35);
        ctx.lineTo(-radius * 0.1, -radius * 0.25);
        ctx.lineTo(0, -radius * 0.33);
        ctx.moveTo(radius * 0.05, -radius * 0.35);
        ctx.lineTo(radius * 0.1, -radius * 0.25);
        ctx.lineTo(0, -radius * 0.33);
        ctx.fill();
        
        ctx.restore();
    }

    static drawBoss(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Аура
        const auraGrad = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 1.5);
        auraGrad.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Тело
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Рога
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, -radius * 0.6);
        ctx.quadraticCurveTo(-radius * 0.5, -radius * 1.3, -radius * 0.2, -radius * 1.5);
        ctx.quadraticCurveTo(-radius * 0.1, -radius * 1.0, -radius * 0.1, -radius * 0.5);
        ctx.moveTo(radius * 0.3, -radius * 0.6);
        ctx.quadraticCurveTo(radius * 0.5, -radius * 1.3, radius * 0.2, -radius * 1.5);
        ctx.quadraticCurveTo(radius * 0.1, -radius * 1.0, radius * 0.1, -radius * 0.5);
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(-radius * 0.2, -radius * 0.1, radius * 0.12, 0, Math.PI * 2);
        ctx.arc(radius * 0.2, -radius * 0.1, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Зубы
        ctx.fillStyle = '#fff';
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * radius * 0.1, radius * 0.1);
            ctx.lineTo(i * radius * 0.1 - radius * 0.05, radius * 0.3);
            ctx.lineTo(i * radius * 0.1 + radius * 0.05, radius * 0.3);
            ctx.fill();
        }
        
        ctx.restore();
    }

    static drawDeath(ctx, x, y, radius, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Капюшон
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.2, radius * 0.6, Math.PI, 0);
        ctx.fill();
        
        // Плащ
        ctx.beginPath();
        ctx.moveTo(-radius * 0.5, -radius * 0.3);
        ctx.quadraticCurveTo(-radius * 0.8, radius * 0.5, -radius * 0.3, radius * 0.8);
        ctx.lineTo(radius * 0.3, radius * 0.8);
        ctx.quadraticCurveTo(radius * 0.8, radius * 0.5, radius * 0.5, -radius * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Коса
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(radius * 0.3, -radius * 0.5);
        ctx.quadraticCurveTo(radius * 0.8, -radius * 0.8, radius * 1.2, -radius * 0.3);
        ctx.stroke();
        
        // Лезвие косы
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(radius * 1.2, -radius * 0.3);
        ctx.quadraticCurveTo(radius * 1.4, -radius * 0.5, radius * 1.5, -radius * 0.1);
        ctx.quadraticCurveTo(radius * 1.3, -radius * 0.1, radius * 1.2, -radius * 0.3);
        ctx.fill();
        
        // Глаза (пустые)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-radius * 0.15, -radius * 0.25, radius * 0.1, 0, Math.PI * 2);
        ctx.arc(radius * 0.15, -radius * 0.25, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    static drawEnemy(ctx, enemy, x, y) {
        const drawers = {
            bat: EnemySprites.drawBat,
            skeleton: EnemySprites.drawSkeleton,
            zombie: EnemySprites.drawZombie,
            ghost: EnemySprites.drawGhost,
            golem: EnemySprites.drawGolem,
            werewolf: EnemySprites.drawWerewolf,
            medusa: EnemySprites.drawMedusa,
            vampire: EnemySprites.drawVampire,
            boss: EnemySprites.drawBoss,
            death: EnemySprites.drawDeath
        };
        
        const drawer = drawers[enemy.type];
        if (drawer) {
            drawer(ctx, x, y, enemy.radius, enemy.color);
        }
    }
}