import { Player } from '../entities/Player.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { Renderer } from '../systems/Renderer.js';
import { PickupSystem } from '../systems/PickupSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { I18n } from '../utils/I18n.js';
import { AudioManager } from '../utils/AudioManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { GameModes } from '../gameModes/GameModes.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.i18n = new I18n();
        this.audio = new AudioManager();
        this.player = null;
        this.enemySystem = null;
        this.weaponSystem = null;
        this.waveSystem = null;
        this.renderer = null;
        this.pickupSystem = null;
        this.ui = null;
        this.saveSystem = new SaveSystem();
        this.shopSystem = new ShopSystem();
        this.gameTime = 0;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.state = 'menu';
        this.keys = {};
        this.levelUpOptions = [];
        this.character = null;
        this.settings = this.saveSystem.loadSettings();
        this.animationFrameId = null;
        this.MAX_WEAPONS = 6;
        this.MAX_PASSIVES = 6;
        this.gameLoop = this.gameLoop.bind(this);
    }

    async init() {
        await this.i18n.init();
        this.player = new Player();
        this.enemySystem = new EnemySystem();
        this.weaponSystem = new WeaponSystem(this.player);
        this.waveSystem = new WaveSystem();
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.pickupSystem = new PickupSystem(this.player);
        this.ui = new UIManager(this);
        this.setupInput();
        this.renderer.resize();
        window.addEventListener('resize', () => this.renderer.resize());
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); this.togglePause(); }
            if (this.state === 'levelup') {
                const m = {'Digit1':0,'Numpad1':0,'Digit2':1,'Numpad2':1,'Digit3':2,'Numpad3':2,'Digit4':3,'Numpad4':3};
                if (m[e.code] !== undefined) { e.preventDefault(); this.selectLevelUpOption(m[e.code]); }
            }
        });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    start() {
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
        this.player = new Player();
        this.enemySystem = new EnemySystem();
        this.weaponSystem = new WeaponSystem(this.player);
        this.waveSystem = new WaveSystem();
        this.pickupSystem = new PickupSystem(this.player);
        this.gameTime = 0; this.lastTime = performance.now(); this.state = 'playing';
        document.getElementById('startScreen')?.remove();
        if (this.ui) this.ui.hideAll();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    startWithCharacter(character, modeId) {
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
        this.character = character;
        this.player = new Player(character);
        character.applyBonuses(this.player);
        this.shopSystem.applyUpgrades(this.player);
        this.weaponSystem = new WeaponSystem(this.player, character.startingWeapon);
        new GameModes().applyModifiers(this, modeId);
        this.enemySystem = new EnemySystem();
        this.waveSystem = new WaveSystem();
        this.pickupSystem = new PickupSystem(this.player);
        this.gameTime = 0; this.lastTime = performance.now(); this.state = 'playing';
        document.getElementById('startScreen')?.remove();
        if (this.ui) this.ui.hideAll();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    goToMenu() {
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
        this.state = 'menu';
        if (this.enemySystem) this.enemySystem.reset();
        if (this.weaponSystem) { this.weaponSystem.projectiles = []; this.weaponSystem.effects = []; }
        if (this.pickupSystem) this.pickupSystem.reset();
        if (this.ui) this.ui.hideAll();
        document.dispatchEvent(new CustomEvent('showMainMenu'));
    }

    gameLoop(time) {
        this.deltaTime = (time - this.lastTime) / 1000;
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        this.lastTime = time;
        if (this.state === 'playing') this.update(this.deltaTime);
        this.render();
        if (this.ui) this.ui.update();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    update(dt) {
        this.gameTime += dt;
        let dx = 0, dy = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;
        if (dx !== 0 || dy !== 0) { const l = Math.hypot(dx, dy); dx /= l; dy /= l; }
        this.player.move(dx, dy, dt);
        this.autoAim();
        this.waveSystem.update(dt, this.gameTime);
        this.enemySystem.update(dt, this.player, this.waveSystem);
        this.weaponSystem.update(dt, this.enemySystem.enemies);
        this.pickupSystem.update(dt);
        this.checkPlayerCollisions();
        this.checkProjectileCollisions();
        if (this.player.exp >= this.player.expToNext) this.levelUp();
    }

    autoAim() {
        const enemies = this.enemySystem.enemies;
        if (enemies.length === 0) return;
        let nearest = null, minDist = Infinity;
        for (const e of enemies) { const d = Math.hypot(e.x-this.player.x, e.y-this.player.y); if (d < minDist) { minDist = d; nearest = e; } }
        if (nearest) { const dx = nearest.x-this.player.x, dy = nearest.y-this.player.y, d = Math.hypot(dx, dy)||1; this.player.facing = {x:dx/d, y:dy/d}; }
    }

    checkPlayerCollisions() {
        if (this.player.invincible > 0) return;
        for (const e of this.enemySystem.enemies) {
            if (Math.hypot(this.player.x-e.x, this.player.y-e.y) < this.player.radius+e.radius) {
                this.player.hp -= Math.max(1, e.damage-this.player.armor);
                this.player.invincible = 0.5;
                this.audio.play('damage');
                if (this.player.hp <= 0) { this.player.hp = 0; this.die(); return; }
                break;
            }
        }
    }

    checkProjectileCollisions() {
        const proj = this.weaponSystem.projectiles;
        const enemies = this.enemySystem.enemies;
        for (let i = proj.length-1; i >= 0; i--) {
            const p = proj[i]; let hit = false;
            for (let j = enemies.length-1; j >= 0; j--) {
                const e = enemies[j];
                if (Math.hypot(p.x-e.x, p.y-e.y) < (p.radius||5)+e.radius) {
                    e.hp -= p.damage; e.hitFlash = 0.15;
                    if (e.hp <= 0) { this.onEnemyKilled(e); enemies.splice(j,1); }
                    hit = true; if (!p.piercing) break;
                }
            }
            if (hit && !p.piercing) proj.splice(i,1);
        }
        for (let i = enemies.length-1; i >= 0; i--) { if (enemies[i].hp <= 0) { this.onEnemyKilled(enemies[i]); enemies.splice(i,1); } }
    }

    onEnemyKilled(enemy) {
        this.player.kills++;
        this.audio.play('kill');
        this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'exp');
        if (Math.random() < 0.3) this.pickupSystem.spawnPickup(enemy.x, enemy.y, 'gold');
    }

    levelUp() {
        this.player.level++;
        this.player.exp -= this.player.expToNext;
        this.player.expToNext = Math.floor(this.player.expToNext*1.2);
        this.player.heal(10);
        this.audio.play('levelup');
        this.state = 'levelup';
        this.levelUpOptions = this.generateLevelUpOptions();
        this.ui.showLevelUp(this.levelUpOptions);
    }

    generateLevelUpOptions() {
        const options = [];
        const currentTypes = this.weaponSystem.weapons.map(w => w.type);
        const weapons = ['magic_wand','garlic','fire_wand','king_bible','santa_water','lightning_ring','axe','cross'];
        if (this.weaponSystem.weapons.length < this.MAX_WEAPONS) weapons.forEach(t => { if (!currentTypes.includes(t)) options.push({type:'weapon',id:t,name:this.i18n.t('weapons.'+t),icon:this.weaponSystem.getWeaponIcon(t)}); });
        this.weaponSystem.weapons.forEach(w => { if (w.level < w.maxLevel) options.push({type:'upgrade',weaponType:w.type,name:this.i18n.t('weapons.'+w.type)+' LV'+(w.level+1),icon:w.icon}); });
        ['spinach','armor','hollow_heart','empty_tome','candelabrador','spellbinder','duplicator','attractorb'].forEach(id => { if (this.player.getPassiveLevel(id) < 5) options.push({type:'passive',id,name:this.i18n.t('passives.'+id),icon:this.getPassiveIcon(id)}); });
        for (let i = options.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [options[i],options[j]] = [options[j],options[i]]; }
        return options.slice(0, 4);
    }

    getPassiveIcon(t) { const i = {spinach:'🥬',armor:'🛡️',hollow_heart:'❤️',empty_tome:'📖',candelabrador:'🕯️',spellbinder:'🔮',duplicator:'🔄',attractorb:'🧲'}; return i[t]||'❓'; }

    selectLevelUpOption(i) {
        if (i < 0 || i >= this.levelUpOptions.length) return;
        const o = this.levelUpOptions[i];
        if (o.type === 'weapon') this.weaponSystem.addWeapon(o.id);
        else if (o.type === 'upgrade') this.weaponSystem.upgradeWeapon(o.weaponType);
        else this.applyPassive(o.id);
        this.state = 'playing'; this.ui.hideLevelUp(); this.lastTime = performance.now();
    }

    applyPassive(t) {
        this.player.addPassive(t);
        switch(t) { case 'spinach':this.player.might+=0.1;break; case 'armor':this.player.armor+=1;break; case 'hollow_heart':const b=Math.floor(this.player.maxHp*0.2);this.player.maxHp+=b;this.player.hp+=b;break; case 'empty_tome':this.player.cooldown+=0.08;break; case 'candelabrador':this.player.area+=0.1;break; case 'spellbinder':this.player.duration+=0.1;break; case 'duplicator':this.player.amount+=1;break; case 'attractorb':this.player.magnet+=1;break; }
    }

    togglePause() { if (this.state==='playing') { this.state='paused'; this.ui.showPause(); } else if (this.state==='paused') { this.state='playing'; this.lastTime=performance.now(); this.ui.hidePause(); } }

    die() {
        this.state='dead'; this.audio.play('death');
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId=null; }
        this.ui.showDeath(this.player, {time:this.gameTime,kills:this.player.kills,level:this.player.level,wave:this.waveSystem.getWave()});
    }

    render() {
        this.renderer.clear();
        this.renderer.drawGrid(this.player);
        this.renderer.drawPickups(this.pickupSystem.pickups, this.player);
        this.renderer.drawEnemies(this.enemySystem.enemies, this.player);
        this.weaponSystem.weapons.forEach(w => { if (w.type==='garlic') this.renderer.drawGarlicAura(this.player, w.range*w.getArea()); if (w.getBookPositions) this.renderer.drawBooks(w.getBookPositions(), this.player); });
        const ctx = this.ctx;
        this.weaponSystem.projectiles.forEach(p => { const sx=this.canvas.width/2+(p.x-this.player.x), sy=this.canvas.height/2+(p.y-this.player.y); ctx.fillStyle=p.color||'#fff'; ctx.beginPath(); ctx.arc(sx,sy,p.radius||3,0,Math.PI*2); ctx.fill(); });
        this.renderer.drawPlayer(this.player);
        this.renderer.drawHUD(this);
    }

    getState() { return this.state; }
    getPlayer() { return this.player; }
    getGameTime() { return this.gameTime; }
    getWave() { return this.waveSystem?this.waveSystem.getWave():1; }
}