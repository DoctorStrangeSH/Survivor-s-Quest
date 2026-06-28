// Web Worker для тяжелых вычислений
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch(type) {
        case 'updateEnemies':
            const result = updateEnemies(data);
            self.postMessage({ type: 'enemiesUpdated', data: result });
            break;
            
        case 'checkCollisions':
            const collisions = checkCollisions(data);
            self.postMessage({ type: 'collisionsChecked', data: collisions });
            break;
            
        case 'calculatePathfinding':
            const path = calculatePathfinding(data);
            self.postMessage({ type: 'pathCalculated', data: path });
            break;
    }
};

function updateEnemies(data) {
    const { enemies, player, dt } = data;
    
    // Массовое обновление позиций врагов
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            enemy.x += (dx / dist) * enemy.speed * dt;
            enemy.y += (dy / dist) * enemy.speed * dt;
        }
    }
    
    return enemies;
}

function checkCollisions(data) {
    const { projectiles, enemies } = data;
    const hits = [];
    
    for (let i = 0; i < projectiles.length; i++) {
        const proj = projectiles[i];
        
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            const dx = proj.x - enemy.x;
            const dy = proj.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < (proj.radius || 5) + enemy.radius) {
                hits.push({ projectileIndex: i, enemyIndex: j });
                break;
            }
        }
    }
    
    return hits;
}

function calculatePathfinding(data) {
    // A* pathfinding для боссов (можно добавить позже)
    return [];
}