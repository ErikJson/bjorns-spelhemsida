// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TOWER_SIZE: 80,
    CREATURE_SIZE: 40,
    MAX_LEVEL: 10
};

// Difficulty presets
const DIFFICULTY = {
    easy: {
        coinRate: 6,
        towerHealth: 2000,
        levelScaling: 1.25, // increased from 1.1
        enemySpawnBase: 6000,
        enemySpawnReduction: 250, // increased from 150
        playerBoost: 1.3,
        enemyNerf: 0.7
    },
    normal: {
        coinRate: 4,
        towerHealth: 1500,
        levelScaling: 1.35, // increased from 1.15
        enemySpawnBase: 5000,
        enemySpawnReduction: 300, // increased from 150
        playerBoost: 1.0,
        enemyNerf: 1.0
    },
    hard: {
        coinRate: 3,
        towerHealth: 1000,
        levelScaling: 1.5, // increased from 1.25
        enemySpawnBase: 3500,
        enemySpawnReduction: 400, // increased from 200
        playerBoost: 0.8,
        enemyNerf: 1.3
    }
};

// Creature Templates
const CREATURE_TYPES = {
    fire: {
        name: 'Flamewing',
        health: 100, // increased from 80
        damage: 18, // increased from 15
        speed: 2.2, // slightly faster
        range: 90, // increased from 80
        cost: 25, // reduced from 30
        color: '#ff6b6b',
        attackSpeed: 900 // faster (was 1000)
    },
    water: {
        name: 'Aquabeast',
        health: 150, // increased from 120
        damage: 15, // increased from 12
        speed: 1.7, // slightly faster
        range: 80, // increased from 70
        cost: 30, // reduced from 40
        color: '#4dabf7',
        attackSpeed: 1000 // faster (was 1200)
    },
    earth: {
        name: 'Rockgolem',
        health: 250, // increased from 200
        damage: 10, // increased from 8
        speed: 1.2, // slightly faster
        range: 70, // increased from 60
        cost: 40, // reduced from 50
        color: '#8b6f47',
        attackSpeed: 1300 // faster (was 1500)
    },
    electric: {
        name: 'Voltiger',
        health: 80, // increased from 60
        damage: 25, // increased from 20
        speed: 2.8, // slightly faster
        range: 100, // increased from 90
        cost: 28, // reduced from 35
        color: '#ffd43b',
        attackSpeed: 700 // faster (was 800)
    },
    wind: {
        name: 'Skytalon',
        health: 65, // increased from 50
        damage: 12, // increased from 10
        speed: 3.3, // faster
        range: 85, // increased from 75
        cost: 20, // reduced from 25
        color: '#a5d8ff',
        attackSpeed: 800 // faster (was 900)
    }
};

// Sound Effects System
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.createSounds();
    }
    
    createSounds() {
        // Using Web Audio API to create sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this.sounds = {
            deploy: () => this.playTone(audioContext, 300, 0.1, 'sine'),
            attack: () => this.playTone(audioContext, 150, 0.05, 'square'),
            hit: () => this.playTone(audioContext, 100, 0.08, 'triangle'),
            coinGain: () => this.playTone(audioContext, 800, 0.05, 'sine'),
            victory: () => this.playVictory(audioContext),
            defeat: () => this.playDefeat(audioContext),
            levelUp: () => this.playLevelUp(audioContext),
            towerHit: () => this.playTowerHit(audioContext)
        };
    }
    
    playTone(audioContext, frequency, duration, type = 'sine') {
        if (!this.enabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    playVictory(audioContext) {
        if (!this.enabled) return;
        const notes = [523, 659, 784, 1047]; // C, E, G, C
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(audioContext, freq, 0.2, 'sine'), i * 100);
        });
    }
    
    playDefeat(audioContext) {
        if (!this.enabled) return;
        const notes = [400, 350, 300, 250]; // Descending tones
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(audioContext, freq, 0.15, 'sawtooth'), i * 100);
        });
    }
    
    playLevelUp(audioContext) {
        if (!this.enabled) return;
        const notes = [440, 554, 659]; // A, C#, E
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(audioContext, freq, 0.15, 'sine'), i * 80);
        });
    }
    
    playTowerHit(audioContext) {
        if (!this.enabled) return;
        this.playTone(audioContext, 80, 0.2, 'sawtooth');
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Game State
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.soundManager = new SoundManager();
        this.difficulty = 'normal'; // default difficulty
        this.isPaused = false;
        this.coins = 150;
        this.level = 1;
        this.selectedCreatureType = null;
        this.creatures = [];
        this.enemyCreatures = [];
        this.projectiles = [];
        
        const diffSettings = DIFFICULTY[this.difficulty];
        this.playerTower = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 60,
            health: diffSettings.towerHealth,
            maxHealth: diffSettings.towerHealth
        };
        
        this.enemyTower = {
            x: this.canvas.width / 2,
            y: 60,
            health: diffSettings.towerHealth,
            maxHealth: diffSettings.towerHealth
        };
        
        this.lastCoinGeneration = Date.now();
        this.lastEnemySpawn = Date.now();
        this.gameRunning = true;
        
        this.soundManager = new SoundManager();
        
        this.setupEventListeners();
        this.gameLoop();
        this.startCoinGeneration();
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40;
        this.canvas.width = Math.min(CONFIG.CANVAS_WIDTH, containerWidth);
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
    }
    
    setupEventListeners() {
        // Creature card selection
        document.querySelectorAll('.creature-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                const cost = parseInt(card.dataset.cost);
                
                if (this.coins >= cost) {
                    document.querySelectorAll('.creature-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedCreatureType = type;
                } else {
                    this.showMessage('Not enough coins!', 1000);
                }
            });
        });
        
        // Canvas click to deploy creature
        this.canvas.addEventListener('click', (e) => {
            if (this.selectedCreatureType && this.gameRunning && !this.isPaused) {
                const rect = this.canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
                
                // Can only deploy in bottom half
                if (y > this.canvas.height / 2) {
                    this.deployCreature(this.selectedCreatureType, x, y, true);
                } else {
                    this.showMessage('Deploy in your half!', 1000);
                }
            }
        });
        
        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.reset();
        });
        
        // Difficulty selector
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.changeDifficulty(e.target.value);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                this.togglePause();
            } else if (e.key === 'r' || e.key === 'R') {
                this.reset();
            } else if (e.key === 'm' || e.key === 'M') {
                const enabled = this.soundManager.toggle();
                this.showMessage(enabled ? '🔊 Sound ON' : '🔇 Sound OFF', 1000);
            }
        });
        
        // Sound toggle button
        document.getElementById('sound-btn').addEventListener('click', () => {
            const enabled = this.soundManager.toggle();
            const btn = document.getElementById('sound-btn');
            btn.textContent = enabled ? '🔊 Sound' : '🔇 Muted';
            this.showMessage(enabled ? '🔊 Sound ON' : '🔇 Sound OFF', 1000);
        });
    }
    
    deployCreature(type, x, y, isPlayer) {
        const template = CREATURE_TYPES[type];
        const cost = template.cost;
        
        if (isPlayer && this.coins < cost) {
            return;
        }
        
        if (isPlayer) {
            this.coins -= cost;
            this.updateUI();
        }
        
        const diffSettings = DIFFICULTY[this.difficulty];
        const multiplier = isPlayer ? diffSettings.playerBoost : diffSettings.enemyNerf;
        
        const creature = {
            type,
            x,
            y,
            health: template.health * multiplier,
            maxHealth: template.health * multiplier,
            damage: template.damage * multiplier,
            speed: template.speed,
            range: template.range,
            color: template.color,
            isPlayer,
            lastAttack: 0,
            attackSpeed: template.attackSpeed,
            target: null
        };
        
        if (isPlayer) {
            this.creatures.push(creature);
            this.selectedCreatureType = null;
            document.querySelectorAll('.creature-card').forEach(c => c.classList.remove('selected'));
            this.soundManager.play('deploy');
        } else {
            this.enemyCreatures.push(creature);
        }
    }
    
    startCoinGeneration() {
        let coinCounter = 0;
        setInterval(() => {
            if (this.gameRunning && !this.isPaused) {
                const diffSettings = DIFFICULTY[this.difficulty];
                this.coins += diffSettings.coinRate;
                
                // Only play coin sound every 5 seconds to avoid annoyance
                coinCounter++;
                if (coinCounter % 5 === 0) {
                    this.soundManager.play('coinGain');
                }
                
                this.updateUI();
            }
        }, 1000);
    }
    
    spawnEnemyCreatures() {
        const now = Date.now();
        const diffSettings = DIFFICULTY[this.difficulty];
        // Slower enemy spawning, especially at early levels
        const baseInterval = diffSettings.enemySpawnBase;
        const levelReduction = this.level * diffSettings.enemySpawnReduction;
        const spawnInterval = Math.max(2000, baseInterval - levelReduction);
        
        if (now - this.lastEnemySpawn > spawnInterval && this.gameRunning && !this.isPaused) {
            const types = Object.keys(CREATURE_TYPES);
            const randomType = types[Math.floor(Math.random() * types.length)];
            const x = Math.random() * (this.canvas.width - 100) + 50;
            this.deployCreature(randomType, x, 120, false);
            this.lastEnemySpawn = now;
        }
    }
    
    updateCreatures() {
        // Update player creatures
        this.creatures = this.creatures.filter(creature => {
            if (creature.health <= 0) return false;
            
            // Find nearest enemy or tower
            let target = this.findNearestTarget(creature, this.enemyCreatures, this.enemyTower);
            
            if (target) {
                const dx = target.x - creature.x;
                const dy = target.y - creature.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > creature.range) {
                    // Move toward target
                    const angle = Math.atan2(dy, dx);
                    creature.x += Math.cos(angle) * creature.speed;
                    creature.y += Math.sin(angle) * creature.speed;
                } else {
                    // Attack target
                    const now = Date.now();
                    if (now - creature.lastAttack > creature.attackSpeed) {
                        this.attackTarget(creature, target);
                        creature.lastAttack = now;
                    }
                }
            } else {
                // No target found, move toward enemy tower
                const dx = this.enemyTower.x - creature.x;
                const dy = this.enemyTower.y - creature.y;
                const angle = Math.atan2(dy, dx);
                creature.x += Math.cos(angle) * creature.speed;
                creature.y += Math.sin(angle) * creature.speed;
                
                // Check if in range of tower
                const towerDist = Math.sqrt(dx * dx + dy * dy);
                if (towerDist <= creature.range) {
                    const now = Date.now();
                    if (now - creature.lastAttack > creature.attackSpeed) {
                        this.attackTarget(creature, this.enemyTower);
                        creature.lastAttack = now;
                    }
                }
            }
            
            return true;
        });
        
        // Update enemy creatures
        this.enemyCreatures = this.enemyCreatures.filter(creature => {
            if (creature.health <= 0) return false;
            
            let target = this.findNearestTarget(creature, this.creatures, this.playerTower);
            
            if (target) {
                const dx = target.x - creature.x;
                const dy = target.y - creature.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > creature.range) {
                    const angle = Math.atan2(dy, dx);
                    creature.x += Math.cos(angle) * creature.speed;
                    creature.y += Math.sin(angle) * creature.speed;
                } else {
                    const now = Date.now();
                    if (now - creature.lastAttack > creature.attackSpeed) {
                        this.attackTarget(creature, target);
                        creature.lastAttack = now;
                    }
                }
            } else {
                // No target found, move toward player tower
                const dx = this.playerTower.x - creature.x;
                const dy = this.playerTower.y - creature.y;
                const angle = Math.atan2(dy, dx);
                creature.x += Math.cos(angle) * creature.speed;
                creature.y += Math.sin(angle) * creature.speed;
                
                // Check if in range of tower
                const towerDist = Math.sqrt(dx * dx + dy * dy);
                if (towerDist <= creature.range) {
                    const now = Date.now();
                    if (now - creature.lastAttack > creature.attackSpeed) {
                        this.attackTarget(creature, this.playerTower);
                        creature.lastAttack = now;
                    }
                }
            }
            
            return true;
        });
    }
    
    findNearestTarget(creature, enemies, tower) {
        let nearest = null;
        let minDist = Infinity;
        
        // Check enemy creatures
        enemies.forEach(enemy => {
            const dx = enemy.x - creature.x;
            const dy = enemy.y - creature.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDist && dist < creature.range * 1.5) {
                minDist = dist;
                nearest = enemy;
            }
        });
        
        // Check tower
        const dx = tower.x - creature.x;
        const dy = tower.y - creature.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < minDist && dist < creature.range * 2) {
            nearest = tower;
        }
        
        return nearest;
    }
    
    attackTarget(attacker, target) {
        // Create projectile
        this.projectiles.push({
            x: attacker.x,
            y: attacker.y,
            targetX: target.x,
            targetY: target.y,
            target: target,
            damage: attacker.damage,
            color: attacker.color,
            speed: 8
        });
        this.soundManager.play('attack');
    }
    
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(proj => {
            const dx = proj.targetX - proj.x;
            const dy = proj.targetY - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < proj.speed) {
                // Hit target
                if (proj.target.health !== undefined) {
                    proj.target.health -= proj.damage;
                    
                    // Play appropriate hit sound
                    if (proj.target === this.playerTower || proj.target === this.enemyTower) {
                        this.soundManager.play('towerHit');
                    } else {
                        this.soundManager.play('hit');
                    }
                    
                    this.updateUI();
                    
                    // Check if tower destroyed
                    if (proj.target === this.playerTower && proj.target.health <= 0) {
                        this.endGame(false);
                    } else if (proj.target === this.enemyTower && proj.target.health <= 0) {
                        this.endGame(true);
                    }
                }
                return false;
            }
            
            const angle = Math.atan2(dy, dx);
            proj.x += Math.cos(angle) * proj.speed;
            proj.y += Math.sin(angle) * proj.speed;
            
            return true;
        });
    }
    
    draw() {
        // Clear canvas
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.5, '#90ee90');
        gradient.addColorStop(1, '#d2b48c');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw mid-line
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw towers
        this.drawTower(this.playerTower, true);
        this.drawTower(this.enemyTower, false);
        
        // Draw creatures
        this.creatures.forEach(c => this.drawCreature(c));
        this.enemyCreatures.forEach(c => this.drawCreature(c));
        
        // Draw projectiles
        this.projectiles.forEach(p => this.drawProjectile(p));
    }
    
    drawTower(tower, isPlayer) {
        const size = CONFIG.TOWER_SIZE;
        const x = tower.x - size / 2;
        const y = tower.y - size / 2;
        
        // Tower base
        this.ctx.fillStyle = isPlayer ? '#4ade80' : '#f87171';
        this.ctx.fillRect(x, y, size, size);
        
        // Tower details
        this.ctx.strokeStyle = isPlayer ? '#22c55e' : '#dc2626';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, size, size);
        
        // Windows
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.ctx.fillRect(x + 10 + i * 22, y + 10 + j * 22, 15, 15);
            }
        }
        
        // Health bar
        const healthBarWidth = size;
        const healthBarHeight = 8;
        const healthPercent = tower.health / tower.maxHealth;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x, y - 15, healthBarWidth, healthBarHeight);
        
        this.ctx.fillStyle = isPlayer ? '#4ade80' : '#f87171';
        this.ctx.fillRect(x, y - 15, healthBarWidth * healthPercent, healthBarHeight);
        
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y - 15, healthBarWidth, healthBarHeight);
    }
    
    drawCreature(creature) {
        const size = CONFIG.CREATURE_SIZE;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(creature.x, creature.y + size / 2 + 5, size / 2, size / 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Body (isometric-style)
        this.ctx.fillStyle = creature.color;
        this.ctx.beginPath();
        // Create a diamond/rhombus shape for isometric feel
        this.ctx.moveTo(creature.x, creature.y - size / 2);
        this.ctx.lineTo(creature.x + size / 2, creature.y);
        this.ctx.lineTo(creature.x, creature.y + size / 2);
        this.ctx.lineTo(creature.x - size / 2, creature.y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Outline
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(creature.x - 8, creature.y - 5, 4, 0, Math.PI * 2);
        this.ctx.arc(creature.x + 8, creature.y - 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(creature.x - 8, creature.y - 5, 2, 0, Math.PI * 2);
        this.ctx.arc(creature.x + 8, creature.y - 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Health bar
        const healthBarWidth = size;
        const healthBarHeight = 5;
        const healthPercent = creature.health / creature.maxHealth;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(creature.x - healthBarWidth / 2, creature.y - size / 2 - 10, healthBarWidth, healthBarHeight);
        
        this.ctx.fillStyle = creature.isPlayer ? '#4ade80' : '#f87171';
        this.ctx.fillRect(creature.x - healthBarWidth / 2, creature.y - size / 2 - 10, healthBarWidth * healthPercent, healthBarHeight);
    }
    
    drawProjectile(proj) {
        this.ctx.fillStyle = proj.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = proj.color;
        this.ctx.beginPath();
        this.ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    updateUI() {
        document.getElementById('coins').textContent = this.coins;
        document.getElementById('level').textContent = this.level;
        
        // Player tower health
        const playerHealthPercent = (this.playerTower.health / this.playerTower.maxHealth) * 100;
        document.getElementById('player-health').style.width = playerHealthPercent + '%';
        document.getElementById('player-health-text').textContent = 
            `${Math.max(0, Math.floor(this.playerTower.health))}/${this.playerTower.maxHealth}`;
        
        // Enemy tower health
        const enemyHealthPercent = (this.enemyTower.health / this.enemyTower.maxHealth) * 100;
        document.getElementById('enemy-health').style.width = enemyHealthPercent + '%';
        document.getElementById('enemy-health-text').textContent = 
            `${Math.max(0, Math.floor(this.enemyTower.health))}/${this.enemyTower.maxHealth}`;
        
        // Update creature cards availability
        document.querySelectorAll('.creature-card').forEach(card => {
            const cost = parseInt(card.dataset.cost);
            if (this.coins < cost) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }
        });
    }
    
    endGame(playerWon) {
        this.gameRunning = false;
        
        if (playerWon) {
            this.showMessage(`🎉 Victory! Level ${this.level} Complete! 🎉`, 3000);
            this.soundManager.play('victory');
            
            setTimeout(() => {
                if (this.level < CONFIG.MAX_LEVEL) {
                    this.nextLevel();
                } else {
                    this.showMessage('🏆 You Won All Levels! 🏆', 5000);
                    setTimeout(() => this.reset(), 5000);
                }
            }, 3000);
        } else {
            this.showMessage('💀 Defeat! Your Tower Destroyed! 💀', 3000);
            this.soundManager.play('defeat');
            setTimeout(() => this.reset(), 3000);
        }
    }
    
    nextLevel() {
        this.level++;
        this.creatures = [];
        this.enemyCreatures = [];
        this.projectiles = [];
        
        const diffSettings = DIFFICULTY[this.difficulty];
        const scaling = Math.pow(diffSettings.levelScaling, this.level - 1);
        this.playerTower.maxHealth = Math.floor(diffSettings.towerHealth * scaling);
        this.playerTower.health = this.playerTower.maxHealth;
        this.enemyTower.maxHealth = Math.floor(diffSettings.towerHealth * scaling);
        this.enemyTower.health = this.enemyTower.maxHealth;
        
        this.coins = 150;
        this.gameRunning = true;
        this.isPaused = false;
        this.updateUI();
        this.showMessage(`Level ${this.level} Start!`, 2000);
        this.soundManager.play('levelUp');
    }
    
    reset() {
        this.level = 1;
        this.coins = 150;
        this.creatures = [];
        this.enemyCreatures = [];
        this.projectiles = [];
        this.isPaused = false;
        
        const diffSettings = DIFFICULTY[this.difficulty];
        this.playerTower.health = diffSettings.towerHealth;
        this.playerTower.maxHealth = diffSettings.towerHealth;
        this.enemyTower.health = diffSettings.towerHealth;
        this.enemyTower.maxHealth = diffSettings.towerHealth;
        this.gameRunning = true;
        
        document.getElementById('pause-btn').textContent = '⏸️ Pause';
        this.updateUI();
        this.showMessage('New Game Started!', 2000);
    }
    
    showMessage(text, duration) {
        const msgEl = document.getElementById('game-message');
        msgEl.textContent = text;
        msgEl.classList.add('show');
        
        setTimeout(() => {
            msgEl.classList.remove('show');
        }, duration);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        if (this.isPaused) {
            pauseBtn.textContent = '▶️ Resume';
            this.showMessage('⏸️ Game Paused', 99999999); // Stay visible
        } else {
            pauseBtn.textContent = '⏸️ Pause';
            document.getElementById('game-message').classList.remove('show');
        }
    }
    
    changeDifficulty(newDifficulty) {
        this.difficulty = newDifficulty;
        this.showMessage(`Difficulty changed to ${newDifficulty.toUpperCase()}! Restarting...`, 2000);
        setTimeout(() => this.reset(), 2000);
    }
    
    gameLoop() {
        if (this.gameRunning && !this.isPaused) {
            this.spawnEnemyCreatures();
            this.updateCreatures();
            this.updateProjectiles();
        }
        
        this.draw();
        
        // Show pause indicator
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⏸️ PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press SPACE or ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});
