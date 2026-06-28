export class CharacterSprites {
    // Создает спрайт персонажа программно
    static drawAntonio(ctx, x, y, size, facing) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело (красный плащ)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -2, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(-3, -size * 0.55, 2, 0, Math.PI * 2);
        ctx.arc(3, -size * 0.55, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Меч
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(5, -size * 0.7, 3, size * 0.6);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(4, -size * 0.75, 5, 3);
        
        ctx.restore();
    }
    
    static drawImelda(ctx, x, y, size, facing) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело (желтое платье)
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -2, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Шляпа ведьмы
        ctx.fillStyle = '#6d28d9';
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 0.3);
        ctx.lineTo(0, -size * 0.9);
        ctx.lineTo(size * 0.3, -size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(-2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.arc(2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawPasqualina(ctx, x, y, size, facing) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело (зеленое)
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(0, -2, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Чеснок вокруг
        ctx.fillStyle = '#fbbf24';
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4;
            const gx = Math.cos(angle) * size * 0.35;
            const gy = Math.sin(angle) * size * 0.35 - 2;
            ctx.beginPath();
            ctx.arc(gx, gy, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Глаза
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(-2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.arc(2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawGennaro(ctx, x, y, size, facing) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело (оранжевое)
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, -2, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Огонь вокруг
        ctx.fillStyle = '#ef4444';
        for (let i = 0; i < 3; i++) {
            const angle = -Math.PI/2 + (Math.PI * i) / 4;
            const fx = Math.cos(angle) * size * 0.3;
            const fy = Math.sin(angle) * size * 0.3 - 2;
            ctx.beginPath();
            ctx.arc(fx, fy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Глаза
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(-2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.arc(2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawArca(ctx, x, y, size, facing) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело (фиолетовое)
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(0, -2, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Книга в руках
        ctx.fillStyle = '#6d28d9';
        ctx.fillRect(5, -size * 0.4, 8, 6);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(6, -size * 0.35, 6, 4);
        
        // Глаза
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(-2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.arc(2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawPorta(ctx, x, y, size, facing) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело (голубое)
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(0, -2, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Молния
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(3, -size * 0.8);
        ctx.lineTo(0, -size * 0.5);
        ctx.lineTo(3, -size * 0.5);
        ctx.lineTo(-1, -size * 0.2);
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(-2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.arc(2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawLama(ctx, x, y, size, facing) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело (коричневое)
        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.arc(0, -2, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Топор
        ctx.fillStyle = '#92400e';
        ctx.fillRect(5, -size * 0.7, 3, size * 0.5);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(8, -size * 0.7, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(-2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.arc(2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    static drawKrochi(ctx, x, y, size, facing) {
        ctx.save();
        ctx.translate(x, y);
        
        // Тело (золотое)
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, -2, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Крест
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(4, -size * 0.7, 3, size * 0.4);
        ctx.fillRect(2, -size * 0.55, 7, 3);
        
        // Глаза
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(-2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.arc(2, -size * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Рисует спрайт по типу персонажа
    static drawCharacter(ctx, x, y, size, characterType, facing) {
        const drawers = {
            antonio: CharacterSprites.drawAntonio,
            imelda: CharacterSprites.drawImelda,
            pasqualina: CharacterSprites.drawPasqualina,
            gennaro: CharacterSprites.drawGennaro,
            arca: CharacterSprites.drawArca,
            porta: CharacterSprites.drawPorta,
            lama: CharacterSprites.drawLama,
            krochi: CharacterSprites.drawKrochi,
            default: CharacterSprites.drawAntonio
        };
        
        const drawer = drawers[characterType] || drawers.default;
        drawer(ctx, x, y, size, facing);
    }
}