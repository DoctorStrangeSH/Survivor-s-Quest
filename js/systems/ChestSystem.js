export class ChestSystem {
    constructor() {
        this.chests = [];
    }

    spawnChest(x, y, rarity = 'common') {
        const rarities = {
            common: { color: '#94a3b8', icon: '📦', goldMin: 10, goldMax: 50 },
            rare: { color: '#3b82f6', icon: '🎁', goldMin: 50, goldMax: 150 },
            epic: { color: '#a855f7', icon: '👑', goldMin: 100, goldMax: 300 },
            legendary: { color: '#fbbf24', icon: '💎', goldMin: 200, goldMax: 500 }
        };
        
        const config = rarities[rarity] || rarities.common;
        
        this.chests.push({
            x, y,
            radius: 15,
            color: config.color,
            icon: config.icon,
            rarity,
            goldMin: config.goldMin,
            goldMax: config.goldMax,
            opened: false
        });
    }

    update(dt, player, game) {
        for (let i = this.chests.length - 1; i >= 0; i--) {
            const chest = this.chests[i];
            
            if (chest.opened) continue;
            
            const dx = player.x - chest.x;
            const dy = player.y - chest.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < player.radius + 25) {
                this.openChest(chest, game);
                chest.opened = true;
            }
        }
    }

    openChest(chest, game) {
        const gold = Math.floor(Math.random() * (chest.goldMax - chest.goldMin + 1)) + chest.goldMin;
        game.player.gold += gold;
        
        // Шанс на улучшение оружия
        if (Math.random() < 0.5 && game.weaponSystem.weapons.length > 0) {
            const weapon = game.weaponSystem.weapons[Math.floor(Math.random() * game.weaponSystem.weapons.length)];
            if (weapon.level < weapon.maxLevel) {
                weapon.levelUp();
                console.log(`🎁 Chest upgraded ${weapon.type} to LV${weapon.level}!`);
            }
        }
        
        // Эффект открытия
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            game.weaponSystem.effects.push({
                x: chest.x,
                y: chest.y,
                vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100,
                life: 0.5,
                maxLife: 0.5,
                color: '#fbbf24',
                size: 5
            });
        }
        
        game.audio.play('pickup');
    }

    draw(ctx, player, canvas) {
        this.chests.forEach(chest => {
            if (chest.opened) return;
            
            const sx = canvas.width / 2 + (chest.x - player.x);
            const sy = canvas.height / 2 + (chest.y - player.y);
            
            // Пульсация
            const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.2;
            
            ctx.fillStyle = chest.color;
            ctx.beginPath();
            ctx.arc(sx, sy, chest.radius * pulse, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(chest.icon, sx, sy + 7);
        });
    }
}