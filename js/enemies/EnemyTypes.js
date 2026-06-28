export const EnemyTypes = {
    slime: {
        name: 'enemy.slime',
        color: '#4ade80',
        radius: 10,
        speed: 80,
        hp: 20,
        exp: 5,
        damage: 8,
        gold: 2,
        scaleHealth: 10,
        scaleSpeed: 5
    },
    skeleton: {
        name: 'enemy.skeleton',
        color: '#94a3b8',
        radius: 12,
        speed: 110,
        hp: 40,
        exp: 10,
        damage: 12,
        gold: 5,
        scaleHealth: 15,
        scaleSpeed: 5
    },
    bat: {
        name: 'enemy.bat',
        color: '#c084fc',
        radius: 8,
        speed: 170,
        hp: 15,
        exp: 8,
        damage: 6,
        gold: 3,
        scaleHealth: 8,
        scaleSpeed: 7
    },
    golem: {
        name: 'enemy.golem',
        color: '#92400e',
        radius: 18,
        speed: 50,
        hp: 100,
        exp: 25,
        damage: 20,
        gold: 15,
        scaleHealth: 30,
        scaleSpeed: 3
    },
    boss: {
        name: 'enemy.boss',
        color: '#ef4444',
        radius: 30,
        speed: 40,
        hp: 500,
        exp: 200,
        damage: 35,
        gold: 100,
        scaleHealth: 100,
        scaleSpeed: 2,
        isBoss: true
    }
};