class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addExplosion(x, y, color = '#ff6b00', count = 15) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1.0,
                decay: 0.02,
                color: color,
                size: Math.random() * 6 + 2,
                type: 'explosion'
            });
        }
    }

    addTrail(x, y) {
        this.particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 0.8,
            decay: 0.05,
            color: '#f8c927',
            size: Math.random() * 3 + 1,
            type: 'trail'
        });
    }

    addTransformation(x, y) {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 2.0,
                decay: 0.01,
                color: Math.random() > 0.5 ? '#f8c927' : '#ffff00',
                size: Math.random() * 8 + 3,
                type: 'transformation'
            });
        }
    }

    update(ctx) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.vx *= 0.98;
            p.vy *= 0.98;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;

            if (p.type === 'transformation') {
                ctx.shadowBlur = 20;
                ctx.shadowColor = p.color;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

class SoundManager {
    constructor() {
        this.sounds = {};
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.loadSounds();
    }

    loadSounds() {
        try {
            // Tentar carregar apenas os sons que existem
            const soundFiles = {
                launch: 'assets/launch.wav',
                impact: 'assets/impact.wav',
                bgMusic: 'assets/bgMusic.mp3' // Adicione esta linha
            };

            Object.keys(soundFiles).forEach(key => {
                try {
                    this.sounds[key] = new Audio(soundFiles[key]);
                    this.sounds[key].volume = 0.7;
                    // Teste se o arquivo existe
                    this.sounds[key].addEventListener('error', () => {
                        console.log(`Sound file not found: ${soundFiles[key]}`);
                        delete this.sounds[key];
                    });

                    if (key === 'bgMusic') {
                        this.sounds[key].loop = true; // Adiciona loop na música
                    }

                    this.sounds[key].addEventListener('error', () => {
                        console.log(`Sound file not found: ${soundFiles[key]}`);
                        delete this.sounds[key];
                    });
                } catch (e) {
                    console.log(`Failed to load sound: ${key}`);
                }
            });

            // Sons que não existem - criar efeitos alternativos
            this.createAlternativeSounds();
        } catch (e) {
            console.log('Audio system not available');
        }
    }

    createAlternativeSounds() {
        // Criar contexto de áudio para efeitos sintéticos
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not available');
            return;
        }
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext || !this.sfxEnabled) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Silenciosamente falha se não conseguir tocar
        }
    }

    play(soundName) {
        if (!this.sfxEnabled) return;

        if (this.sounds[soundName]) {
            try {
                this.sounds[soundName].currentTime = 0;
                this.sounds[soundName].play().catch(() => {});
            } catch (e) {
                // Falha silenciosamente
            }
        } else {
            // Usar efeitos sintéticos alternativos
            switch (soundName) {
                case 'powerup':
                    this.playTone(440, 0.2);
                    setTimeout(() => this.playTone(660, 0.2), 100);
                    break;
                case 'transformation':
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => this.playTone(220 + i * 110, 0.3, 'sawtooth'), i * 100);
                    }
                    break;
                case 'launch':
                    this.playTone(200, 0.5, 'square');
                    break;
                case 'impact':
                    this.playTone(100, 0.3, 'sawtooth');
                    break;
            }
        }
    }

    playMusic() {
        if (!this.musicEnabled) return;

        if (this.sounds.bgMusic) {
            try {
                this.sounds.bgMusic.play().catch(() => {});
            } catch (e) {
                console.log('Background music not available');
            }
        }
    }

    stopMusic() {
        if (this.sounds.bgMusic) {
            try {
                this.sounds.bgMusic.pause();
            } catch (e) {
                // Falha silenciosamente
            }
        }
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.collected = false;
        this.rotation = 0;
        this.pulse = 0;
        this.radius = 15;

        this.effects = {
            'speed': { color: '#00ff00', name: 'Velocidade Extra' },
            'multishot': { color: '#ff00ff', name: 'Tiro Múltiplo' },
            'pierce': { color: '#00ffff', name: 'Tiro Perfurante' },
            'giant': { color: '#ffff00', name: 'Goku Gigante' },
            'vegeta': { color: '#0000ff', name: 'Vegeta' },
            'trunks': { color: '#9370db', name: 'Trunks' },
            'gohan': { color: '#ffd700', name: 'Gohan' }
        };
    }

    update() {
        this.rotation += 0.05;
        this.pulse += 0.1;
    }

    draw(ctx) {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Glow effect
        const glowSize = this.radius + Math.sin(this.pulse) * 3;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.effects[this.type].color;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Power-up body
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.effects[this.type].color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Symbol
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type[0].toUpperCase(), 0, 5);

        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, health, type = 'normal') {
        this.x = x;
        this.y = y;
        this.health = health;
        this.maxHealth = health;
        this.type = type;
        this.hit = false;
        this.hitAnimation = 0;
        this.moveSpeed = 0;
        this.moveDirection = 1;
        this.originalX = x;
        this.shootTimer = 0;
        this.projectiles = [];

        if (type === 'moving') {
            this.moveSpeed = 1;
        } else if (type === 'shooter') {
            this.shootTimer = Math.random() * 180;
        }
    }

    update() {
        if (this.hit) return;

        // Movement for moving enemies
        if (this.type === 'moving') {
            this.x += this.moveSpeed * this.moveDirection;
            if (Math.abs(this.x - this.originalX) > 100) {
                this.moveDirection *= -1;
            }
        }

        // Cell behavior - teleports and regenerates
        if (this.type === 'cell') {
            this.x += this.moveSpeed * this.moveDirection;
            if (Math.abs(this.x - this.originalX) > 80) {
                this.moveDirection *= -1;
            }
            this.specialTimer++;
            if (this.specialTimer > 300 && this.health < this.maxHealth) {
                this.health = Math.min(this.health + 1, this.maxHealth);
                this.specialTimer = 0;
                particleSystem.addExplosion(this.x, this.y, '#00ff00', 10);
            }
        }

        // Cooler behavior - rapid fire
        if (this.type === 'cooler') {
            this.shootTimer++;
            if (this.shootTimer > 60) { // Shoots faster
                this.shoot();
                this.shootTimer = 0;
            }
        }

        // Broly behavior - charges and becomes stronger
        if (this.type === 'broly') {
            this.specialTimer++;
            if (this.specialTimer > 240) {
                this.charging = true;
                this.moveSpeed = 3;
                this.specialTimer = 0;
                particleSystem.addExplosion(this.x, this.y, '#ffff00', 20);
            }
            if (this.charging) {
                this.x += this.moveSpeed * this.moveDirection;
                if (Math.abs(this.x - this.originalX) > 150) {
                    this.moveDirection *= -1;
                    this.charging = false;
                    this.moveSpeed = 2;
                }
            } else {
                this.x += this.moveSpeed * this.moveDirection;
                if (Math.abs(this.x - this.originalX) > 100) {
                    this.moveDirection *= -1;
                }
            }
        }
        // Shooting for shooter enemies
        if (this.type === 'shooter') {
            this.shootTimer++;
            if (this.shootTimer > 120) { // Shoot every 2 seconds
                this.shoot();
                this.shootTimer = 0;
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.life--;

            if (proj.life <= 0 || proj.y > canvas.height) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    shoot() {
        if (this.type === 'cooler') {
            // Triple shot
            for (let i = -1; i <= 1; i++) {
                this.projectiles.push({
                    x: this.x,
                    y: this.y,
                    vx: -3 + i * 0.5,
                    vy: 2 + i * 0.3,
                    life: 180,
                    radius: 4,
                    color: '#800080'
                });
            }
        } else {
            this.projectiles.push({
                x: this.x,
                y: this.y,
                vx: -2,
                vy: 2,
                life: 180,
                radius: 5,
                color: '#ff0000'
            });
        }
    }

    draw(ctx) {
        if (this.hit) return;

        // Hit animation
        if (this.hitAnimation > 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.sin(this.hitAnimation * 0.5) * 0.2);
            ctx.translate(-this.x, -this.y);
            this.hitAnimation--;
        }

        // Health-based color and type-based appearance
        const healthRatio = this.health / this.maxHealth;
        let color = '#8B008B'; // Purple for normal

        if (this.type === 'moving') color = '#FF4500';
        if (this.type === 'shooter') color = '#DC143C';
        if (this.type === 'boss') color = '#000000';
        if (this.type === 'cell') color = '#00ff00';
        if (this.type === 'cooler') color = '#800080';
        if (this.type === 'broly') color = this.charging ? '#ffff00' : '#228B22';

        if (healthRatio < 0.7) color = '#FF4500';
        if (healthRatio < 0.4) color = '#FF0000';

        // Enemy body
        const size = this.type === 'boss' ? 35 : 25;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Enemy face
        ctx.fillStyle = '#E6E6FA';
        ctx.beginPath();
        ctx.arc(this.x, this.y, size - 5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x - 8, this.y - 5, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 8, this.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Type indicator
        if (this.type === 'moving') {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x - 3, this.y + 10, 6, 3);
        } else if (this.type === 'shooter') {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x - 2, this.y + 8, 4, 8);
        } else if (this.type === 'cell') {
            // Cell spots
            ctx.fillStyle = '#000000';
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI / 2);
                const spotX = this.x + Math.cos(angle) * 10;
                const spotY = this.y + Math.sin(angle) * 10;
                ctx.beginPath();
                ctx.arc(spotX, spotY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'cooler') {
            // Cooler mask
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x - 12, this.y - 8, 24, 6);
        } else if (this.type === 'broly') {
            // Broly spikes
            ctx.fillStyle = '#000000';
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI / 3);
                const spikeX = this.x + Math.cos(angle) * 20;
                const spikeY = this.y + Math.sin(angle) * 20;
                ctx.beginPath();
                ctx.arc(spikeX, spikeY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Health bar
        if (this.maxHealth > 1) {
            const barWidth = 40;
            const barHeight = 6;
            const barX = this.x - barWidth / 2;
            const barY = this.y - (this.type === 'boss' ? 50 : 40);

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' : healthRatio > 0.25 ? '#ffff00' : '#ff0000';
            ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }

        // Draw projectiles
        this.projectiles.forEach(proj => {
            ctx.fillStyle = proj.color || '#FF0000';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        if (this.hitAnimation > 0) {
            ctx.restore();
        }
    }
}
class Ally {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.type = type;
        this.radius = 20;
        this.vx = 0;
        this.vy = 0;
        this.launched = false;
        this.trail = [];
        this.active = true;

        // Different mechanics per ally
        this.mechanics = {
            'vegeta': { force: 25, gravity: 0.25, color: '#0000ff', special: 'explosive' },
            'trunks': { force: 30, gravity: 0.2, color: '#9370db', special: 'sword' },
            'gohan': { force: 35, gravity: 0.15, color: '#ffd700', special: 'kamehameha' }
        };
    }

    update() {
        if (!this.launched || !this.active) return;

        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 15) this.trail.shift();

        // Physics
        const mechanic = this.mechanics[this.type];
        this.vy += mechanic.gravity;
        this.vx *= friction;
        this.vy *= friction;

        this.x += this.vx;
        this.y += this.vy;

        // Boundaries
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -bounceReduction;
        }

        if (this.y + this.radius > canvas.height - 40) {
            this.y = canvas.height - 40 - this.radius;
            this.vy *= -bounceReduction;
        }

        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -bounceReduction;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -bounceReduction;
        }

        // Reset conditions
        if ((Math.abs(this.vx) < 1.0 && Math.abs(this.vy) < 1.0 && this.y > canvas.height - 100) ||
            this.y > canvas.height + 100) {
            this.reset();
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.launched = false;
        this.trail = [];
    }

    launch(deltaX, deltaY, distance) {
        const mechanic = this.mechanics[this.type];
        const force = Math.min(distance / 50, 2) * mechanic.force;
        this.vx = (deltaX / distance) * force;
        this.vy = (deltaY / distance) * force;
        this.launched = true;
        this.trail = [];

        // Special effects
        if (this.type === 'vegeta') {
            particleSystem.addExplosion(this.x, this.y, '#0000ff', 15);
        } else if (this.type === 'trunks') {
            particleSystem.addExplosion(this.x, this.y, '#9370db', 12);
        } else if (this.type === 'gohan') {
            particleSystem.addExplosion(this.x, this.y, '#ffd700', 20);
        }
    }

    draw(ctx) {
        if (!this.active) return;

        const mechanic = this.mechanics[this.type];

        // Trail
        if (this.launched && this.trail.length > 0) {
            ctx.strokeStyle = mechanic.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Body
        ctx.fillStyle = mechanic.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 3, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 8, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 6, this.y - 8, 2, 0, Math.PI * 2);
        ctx.fill();

        // Special features
        if (this.type === 'vegeta') {
            // Vegeta hair
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x - 8, this.y - 15, 6, 0, Math.PI * 2);
            ctx.arc(this.x + 8, this.y - 15, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'trunks') {
            // Trunks hair
            ctx.fillStyle = '#9370db';
            ctx.beginPath();
            ctx.arc(this.x, this.y - 18, 10, 0, Math.PI * 2);
            ctx.fill();
            // Sword
            if (!this.launched) {
                ctx.strokeStyle = '#c0c0c0';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.x + 15, this.y - 10);
                ctx.lineTo(this.x + 15, this.y + 10);
                ctx.stroke();
            }
        } else if (this.type === 'gohan') {
            // Gohan hair
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x, this.y - 16, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class GameState {
    constructor() {
        this.score = 0;
        this.currentLevel = 0;
        this.shotsUsed = 0;
        this.maxShots = 8;
        this.superSaiyajin = false;
        this.dragonBallCollected = false;
        this.stars = 0;
        this.totalStars = 0;
        this.activePowerUps = [];
        this.allies = [];
        this.upgrades = {
            force: 1,
            precision: 1,
            luck: 1
        };
    }

    addScore(points) {
        this.score += points;
        document.getElementById('scoreDisplay').textContent = this.score;
    }

    calculateStars() {
        let stars = 1; // Base star
        if (this.shotsUsed <= 2) stars++;
        if (this.dragonBallCollected) stars++;
        return Math.min(stars, 3);
    }

    nextLevel() {
        this.stars = this.calculateStars();
        this.totalStars += this.stars;
        this.currentLevel++;
        this.shotsUsed = 0;
        this.dragonBallCollected = false;
        this.activePowerUps = [];
        this.levelCompleting = false;
        this.gameOverTriggered = false;
        document.getElementById('levelDisplay').textContent = this.currentLevel + 1;
    }

    reset() {
        this.score = 0;
        this.currentLevel = 0;
        this.shotsUsed = 0;
        this.superSaiyajin = false;
        this.dragonBallCollected = false;
        this.stars = 0;
        this.activePowerUps = [];
        this.allies = [];
        this.allies = [];
        this.levelCompleting = false;
        this.gameOverTriggered = false;
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('levelDisplay').textContent = this.currentLevel + 1;
    }

    addPowerUp(type) {
        if (['vegeta', 'trunks', 'gohan'].includes(type)) {
            // Add ally
            const allyX = 200 + this.allies.length * 80;
            const allyY = canvas.height - 100;
            this.allies.push(new Ally(allyX, allyY, type));
        } else {
            this.activePowerUps.push({
                type: type,
                duration: 900 // 15 seconds at 60fps (3x longer)
            });
        }
    }

    updatePowerUps() {
        for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
            this.activePowerUps[i].duration--;
            if (this.activePowerUps[i].duration <= 0) {
                this.activePowerUps.splice(i, 1);
            }
        }
    }

    hasPowerUp(type) {
        return this.activePowerUps.some(p => p.type === type);
    }
}

function launchAlly(allyType) {
    console.log('Launching ally:', allyType);

    // Set ally as current character
    goku.character = allyType;

    // Set ally properties
    const allyProps = {
        'vegeta': { color: '#0066ff', force: 1.2, gravity: 0.4 },
        'trunks': { color: '#9966ff', force: 1.5, gravity: 0.3 },
        'gohan': { color: '#ffcc00', force: 1.1, gravity: 0.5 }
    };

    if (allyProps[allyType]) {
        goku.color = allyProps[allyType].color;
        goku.force = allyProps[allyType].force;
        goku.gravity = allyProps[allyType].gravity;
        console.log('Ally properties set:', allyProps[allyType]);
    }

    // Auto-launch with medium power
    const angle = -Math.PI / 4; // 45 degrees up
    const power = 0.7;

    goku.vx = Math.cos(angle) * power * 15;
    goku.vy = Math.sin(angle) * power * 15;
    goku.launched = true;

    console.log('Ally launched with velocity:', goku.vx, goku.vy);

    soundManager.playSound('launch');
}

function updateUI() {
    document.getElementById('levelDisplay').textContent = gameState.level;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('totalStars').textContent = gameState.totalStars;

    // Atualizar display de aliados
    const alliesList = document.getElementById('alliesList');
    if (gameState.allies.length === 0) {
        alliesList.textContent = 'Nenhum';
        alliesList.style.color = '#ccc';
    } else {
        const allyNames = gameState.allies.map(ally => {
            switch(ally.type) {
                case 'vegeta': return 'Vegeta';
                case 'trunks': return 'Trunks';
                case 'gohan': return 'Gohan';
                default: return ally.type;
            }
        });
        alliesList.textContent = allyNames.join(', ');
        alliesList.style.color = '#f8c927';
    }
}

let canvas, ctx, gameState, soundManager, particleSystem;
let goku = {};
let levels, enemies, dragonBall, powerUps = [], allies = [];
let dragging = false;
let dragStartX, dragStartY;
let animationId;
let wind = { strength: 0, direction: 1 };

// Physics constants
const normalGravity = 0.3;
const superGravity = 0.15;
const normalForce = 20;
const superForce = 40;
const friction = 0.99;
const bounceReduction = 0.6;

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('gameUI').style.display = 'block';
    initGame();
}

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    gameState = new GameState();
    soundManager = new SoundManager();
    particleSystem = new ParticleSystem();

    soundManager.playMusic();

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (levels) defineLevels();
    }
    resize();
    window.addEventListener('resize', resize);

    function resetGoku() {
        const baseSize = gameState.hasPowerUp('giant') ? 35 : 25;
        goku = {
            x: 120,
            y: canvas.height - 100,
            startX: 120,
            startY: canvas.height - 100,
            radius: baseSize,
            vx: 0,
            vy: 0,
            launched: false,
            trail: [],
            piercing: gameState.hasPowerUp('pierce')
        };
    }

    function defineLevels() {
        const w = canvas.width;
        const h = canvas.height;

        levels = [
            // Level 1 - Easy
            [
                { x: w - 150, y: h - 80, health: 1, type: 'normal' },
                { x: w - 250, y: h - 120, health: 1, type: 'normal' },
                { x: w - 200, y: h - 160, health: 1, type: 'moving' },
                { x: w - 100, y: h - 200, health: 1, type: 'normal' },
                { x: w - 300, y: h - 80, health: 1, type: 'shooter' },
                { x: w - 80, y: h - 120, health: 1, type: 'normal' }
            ],

            // Level 2 - Medium
            [
                { x: w - 200, y: h - 80, health: 1, type: 'normal' },
                { x: w - 120, y: h - 150, health: 1, type: 'moving' },
                { x: w - 300, y: h - 100, health: 2, type: 'cell' },
                { x: w - 150, y: h - 200, health: 1, type: 'shooter' },
                { x: w - 80, y: h - 80, health: 1, type: 'normal' },
                { x: w - 250, y: h - 180, health: 1, type: 'moving' },
                { x: w - 350, y: h - 120, health: 1, type: 'normal' },
                { x: w - 100, y: h - 160, health: 1, type: 'shooter' },
                { x: w - 180, y: h - 240, health: 1, type: 'normal' },
                { x: w - 320, y: h - 160, health: 1, type: 'cell' },
                { x: w - 60, y: h - 200, health: 1, type: 'moving' },
                { x: w - 280, y: h - 220, health: 1, type: 'normal' }
            ],

            // Level 3 - Hard
            [
                { x: w - 250, y: h - 80, health: 2, type: 'normal' },
                { x: w - 150, y: h - 120, health: 1, type: 'shooter' },
                { x: w - 80, y: h - 180, health: 1, type: 'moving' },
                { x: w - 350, y: h - 100, health: 3, type: 'cooler' },
                { x: w - 200, y: h - 200, health: 2, type: 'cell' },
                { x: w - 120, y: h - 260, health: 1, type: 'shooter' },
                { x: w - 300, y: h - 160, health: 2, type: 'moving' },
                { x: w - 100, y: h - 80, health: 1, type: 'normal' },
                { x: w - 180, y: h - 140, health: 2, type: 'shooter' },
                { x: w - 320, y: h - 220, health: 1, type: 'cell' },
                { x: w - 60, y: h - 160, health: 1, type: 'moving' },
                { x: w - 280, y: h - 100, health: 2, type: 'normal' },
                { x: w - 150, y: h - 280, health: 1, type: 'cooler' },
                { x: w - 220, y: h - 320, health: 1, type: 'shooter' },
                { x: w - 380, y: h - 180, health: 2, type: 'moving' },
                { x: w - 90, y: h - 240, health: 1, type: 'cell' },
                { x: w - 260, y: h - 300, health: 1, type: 'normal' },
                { x: w - 340, y: h - 260, health: 2, type: 'shooter' }
            ],

            // Level 4 - Very Hard
            [
                { x: w - 300, y: h - 80, health: 2, type: 'shooter' },
                { x: w - 200, y: h - 140, health: 2, type: 'moving' },
                { x: w - 100, y: h - 200, health: 1, type: 'normal' },
                { x: w - 150, y: h - 260, health: 1, type: 'shooter' },
                { x: w - 400, y: h - 120, health: 4, type: 'broly' },
                { x: w - 250, y: h - 180, health: 3, type: 'cooler' },
                { x: w - 80, y: h - 100, health: 2, type: 'cell' },
                { x: w - 350, y: h - 200, health: 2, type: 'moving' },
                { x: w - 180, y: h - 80, health: 2, type: 'shooter' },
                { x: w - 120, y: h - 320, health: 1, type: 'normal' },
                { x: w - 280, y: h - 240, health: 3, type: 'cell' },
                { x: w - 60, y: h - 180, health: 2, type: 'moving' },
                { x: w - 320, y: h - 140, health: 2, type: 'cooler' },
                { x: w - 220, y: h - 300, health: 1, type: 'shooter' },
                { x: w - 380, y: h - 260, health: 2, type: 'broly' },
                { x: w - 140, y: h - 160, health: 2, type: 'cell' },
                { x: w - 300, y: h - 320, health: 1, type: 'moving' },
                { x: w - 90, y: h - 280, health: 2, type: 'shooter' },
                { x: w - 260, y: h - 120, health: 3, type: 'cooler' },
                { x: w - 160, y: h - 220, health: 2, type: 'normal' },
                { x: w - 340, y: h - 300, health: 2, type: 'cell' },
                { x: w - 200, y: h - 360, health: 1, type: 'broly' },
                { x: w - 110, y: h - 140, health: 2, type: 'moving' },
                { x: w - 290, y: h - 280, health: 2, type: 'shooter' }
            ],

            // Level 5 - Boss Level
            [
                { x: w - 200, y: h - 150, health: 5, type: 'boss' },
                { x: w - 350, y: h - 80, health: 2, type: 'shooter' },
                { x: w - 80, y: h - 220, health: 2, type: 'moving' },
                { x: w - 450, y: h - 120, health: 6, type: 'broly' },
                { x: w - 300, y: h - 200, health: 4, type: 'cooler' },
                { x: w - 150, y: h - 280, health: 3, type: 'cell' },
                { x: w - 100, y: h - 80, health: 3, type: 'shooter' },
                { x: w - 250, y: h - 320, health: 2, type: 'moving' },
                { x: w - 400, y: h - 240, health: 3, type: 'cell' },
                { x: w - 50, y: h - 160, health: 2, type: 'cooler' },
                { x: w - 320, y: h - 100, health: 3, type: 'shooter' },
                { x: w - 180, y: h - 200, health: 2, type: 'moving' },
                { x: w - 280, y: h - 260, health: 4, type: 'broly' },
                { x: w - 120, y: h - 340, health: 2, type: 'cell' },
                { x: w - 380, y: h - 180, health: 3, type: 'cooler' },
                { x: w - 220, y: h - 100, health: 2, type: 'shooter' },
                { x: w - 90, y: h - 300, health: 2, type: 'moving' },
                { x: w - 340, y: h - 280, health: 3, type: 'cell' },
                { x: w - 160, y: h - 120, health: 2, type: 'broly' },
                { x: w - 270, y: h - 180, health: 3, type: 'cooler' },
                { x: w - 130, y: h - 260, health: 2, type: 'shooter' },
                { x: w - 310, y: h - 340, health: 2, type: 'moving' },
                { x: w - 60, y: h - 240, health: 3, type: 'cell' },
                { x: w - 240, y: h - 300, health: 2, type: 'broly' },
                { x: w - 360, y: h - 160, health: 3, type: 'cooler' }
            ]
        ];
    }

    function spawnPowerUps() {
        powerUps = [];
        if (Math.random() < 0.5) { // 50% chance
            const types = ['speed', 'multishot', 'pierce', 'giant', 'vegeta', 'trunks', 'gohan'];
            const type = types[Math.floor(Math.random() * types.length)];
            powerUps.push(new PowerUp(
                Math.random() * (canvas.width - 200) + 100,
                Math.random() * (canvas.height - 200) + 100,
                type
            ));
        }

        // Chance for second power-up
        if (Math.random() < 0.3) {
            const types = ['speed', 'multishot', 'pierce', 'giant', 'vegeta', 'trunks', 'gohan'];
            const type = types[Math.floor(Math.random() * types.length)];
            powerUps.push(new PowerUp(
                Math.random() * (canvas.width - 200) + 100,
                Math.random() * (canvas.height - 200) + 100,
                type
            ));
        }
    }

    function updateWind() {
        wind.strength = (Math.random() - 0.5) * 0.1;
        wind.direction = Math.random() > 0.5 ? 1 : -1;
    }

    function loadLevel() {
        if (gameState.currentLevel >= levels.length) {
            showGameComplete();
            return;
        }

        // Reset flags de controle
        gameState.levelCompleting = false;
        gameState.gameOverTriggered = false;

        enemies = levels[gameState.currentLevel].map(e => new Enemy(e.x, e.y, e.health, e.type));

        // Dragon Ball
        dragonBall = {
            x: Math.random() * (canvas.width - 200) + 100,
            y: Math.random() * (canvas.height - 200) + 100,
            collected: false,
            rotation: 0,
            pulse: 0
        };

        spawnPowerUps();
        updateWind();
        resetGoku();
        gameState.shotsUsed = 0;
    }

    function getPointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function isInsideGoku(x, y) {
        if (!goku.launched && Math.hypot(x - goku.x, y - goku.y) < goku.radius) {
            return { type: 'goku', character: goku };
        }

        // Check allies
        for (let ally of gameState.allies) {
            if (!ally.launched && Math.hypot(x - ally.x, y - ally.y) < ally.radius) {
                return { type: 'ally', character: ally };
            }
        }

        return null;
    }

    function updatePowerMeter() {
        if (!dragging || goku.launched) {
            document.getElementById('powerFill').style.width = '0%';
            return;
        }

        const distance = Math.hypot(goku.x - dragStartX, goku.y - dragStartY);
        const maxDistance = 200;
        const power = Math.min(distance / maxDistance * 100, 100);
        document.getElementById('powerFill').style.width = power + '%';
    }

    let selectedCharacter = null;

    function onDragStart(e) {
        e.preventDefault();
        const { x, y } = getPointerPos(e);
        const character = isInsideGoku(x, y);
        if (character) {
            dragging = true;
            selectedCharacter = character;
            if (character.type === 'goku') {
                dragStartX = goku.startX;
                dragStartY = goku.startY;
            } else {
                dragStartX = character.character.startX;
                dragStartY = character.character.startY;
            }
        }
    }

    function onDragMove(e) {
        e.preventDefault();

        if (!goku.launched && !dragging) {
            const step = 10;
            if (e.key === 'ArrowLeft') goku.x = Math.max(goku.x - step, goku.radius);
            if (e.key === 'ArrowRight') goku.x = Math.min(goku.x + step, canvas.width - goku.radius);
            if (e.key === 'ArrowUp') goku.y = Math.max(goku.y - step, goku.radius);
            if (e.key === 'ArrowDown') goku.y = Math.min(goku.y + step, canvas.height - 40 - goku.radius);
        }

        if (!dragging || goku.launched) return;

        const { x, y } = getPointerPos(e);
        const maxDistance = 150;
        const distance = Math.hypot(x - dragStartX, y - dragStartY);

        if (distance <= maxDistance) {
            goku.x = x;
            goku.y = y;
        } else {
            const angle = Math.atan2(y - dragStartY, x - dragStartX);
            goku.x = dragStartX + Math.cos(angle) * maxDistance;
            goku.y = dragStartY + Math.sin(angle) * maxDistance;
        }

        updatePowerMeter();
    }

    function launchGoku() {
        if (!selectedCharacter) return;

        const char = selectedCharacter.character;
        const deltaX = dragStartX - char.x;
        const deltaY = dragStartY - char.y;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance > 5) {
            if (selectedCharacter.type === 'goku') {
                const currentForce = gameState.superSaiyajin ? superForce : normalForce;
                const forceMultiplier = gameState.hasPowerUp('speed') ? 1.5 : 1;
                const maxForce = currentForce * gameState.upgrades.force * forceMultiplier;

                const force = Math.min(distance / 50, 2) * maxForce;
                goku.vx = (deltaX / distance) * force;
                goku.vy = (deltaY / distance) * force;
                goku.launched = true;
                goku.trail = [];
                gameState.shotsUsed++;

                // Multi-shot power-up
                if (gameState.hasPowerUp('multishot')) {
                    for (let i = 0; i < 2; i++) {
                        const angle = Math.atan2(deltaY, deltaX) + (i - 0.5) * 0.3;
                        particleSystem.addExplosion(
                            goku.x + Math.cos(angle) * 30,
                            goku.y + Math.sin(angle) * 30,
                            '#f8c927', 10
                        );
                    }
                }

                soundManager.play('launch');
                particleSystem.addExplosion(goku.x, goku.y, '#f8c927');
            } else {
                // Launch ally
                char.launch(deltaX, deltaY, distance);
                gameState.shotsUsed++;
                soundManager.play('launch');
            }
        }
    }

    function onDragEnd(e) {
        e.preventDefault();
        if (dragging && !goku.launched) {
            launchGoku();
        }
        dragging = false;
        updatePowerMeter();
    }

    function onMouseLeave(e) {
        if (dragging && !goku.launched) {
            goku.x = dragStartX;
            goku.y = dragStartY;
            dragging = false;
            updatePowerMeter();
        }
    }

    // Event listeners
    canvas.addEventListener("mousedown", onDragStart);
    canvas.addEventListener("mousemove", onDragMove);
    canvas.addEventListener("mouseup", onDragEnd);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchstart", onDragStart, { passive: false });
    canvas.addEventListener("touchmove", onDragMove, { passive: false });
    canvas.addEventListener("touchend", onDragEnd, { passive: false });
    canvas.addEventListener("touchcancel", onDragEnd, { passive: false });

    function drawBackground() {
        // Sky gradient with different themes
        const themes = [
            ['#87CEEB', '#98D8E8', '#90EE90'], // Earth
            ['#4B0082', '#8A2BE2', '#9370DB'], // Space
            ['#FF4500', '#FF6347', '#FFD700'], // Namek
            ['#000000', '#1a1a1a', '#333333'], // Dark
            ['#FF1493', '#FF69B4', '#FFB6C1']  // Majin
        ];

        const theme = themes[Math.min(gameState.currentLevel, themes.length - 1)];
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, theme[0]);
        gradient.addColorStop(0.7, theme[1]);
        gradient.addColorStop(1, theme[2]);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ground
        ctx.fillStyle = gameState.currentLevel < 2 ? '#8B4513' : '#2F4F4F';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

        // Grass/Surface
        ctx.fillStyle = gameState.currentLevel < 2 ? '#228B22' : '#696969';
        ctx.fillRect(0, canvas.height - 45, canvas.width, 5);

        // Wind indicator
        if (Math.abs(wind.strength) > 0.02) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '16px Arial';
            ctx.fillText(`Wind: ${wind.direction > 0 ? '→' : '←'} ${Math.abs(wind.strength * 100).toFixed(1)}`, 20, 100);
        }
    }

    function drawGoku() {
        // Super Saiyajin aura
        if (gameState.superSaiyajin) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#f8c927';
            ctx.beginPath();
            ctx.arc(goku.x, goku.y, goku.radius + 10 + Math.sin(Date.now() * 0.01) * 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Trail effect
        if (goku.launched && goku.trail.length > 0) {
            const trailColor = gameState.superSaiyajin ? '#f8c927' : '#ff8c00';
            ctx.strokeStyle = trailColor;
            ctx.lineWidth = gameState.hasPowerUp('giant') ? 6 : 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(goku.trail[0].x, goku.trail[0].y);
            for (let i = 1; i < goku.trail.length; i++) {
                ctx.lineTo(goku.trail[i].x, goku.trail[i].y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Goku body
        ctx.fillStyle = gameState.hasPowerUp('giant') ? '#FFD700' : '#ff8c00';
        ctx.beginPath();
        ctx.arc(goku.x, goku.y, goku.radius, 0, Math.PI * 2);
        ctx.fill();

        // Goku face
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(goku.x, goku.y - 5, goku.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = gameState.superSaiyajin ? '#00FFFF' : '#000';
        ctx.beginPath();
        ctx.arc(goku.x - 8, goku.y - 10, 3, 0, Math.PI * 2);
        ctx.arc(goku.x + 8, goku.y - 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = gameState.superSaiyajin ? '#f8c927' : '#000';
        ctx.beginPath();
        if (gameState.superSaiyajin) {
            // Spiky Super Saiyajin hair
            ctx.arc(goku.x - 12, goku.y - 20, 10, 0, Math.PI * 2);
            ctx.arc(goku.x, goku.y - 25, 12, 0, Math.PI * 2);
            ctx.arc(goku.x + 12, goku.y - 20, 10, 0, Math.PI * 2);
        } else {
            ctx.arc(goku.x - 10, goku.y - 15, 8, 0, Math.PI * 2);
            ctx.arc(goku.x, goku.y - 20, 10, 0, Math.PI * 2);
            ctx.arc(goku.x + 10, goku.y - 15, 8, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    function drawDragonBall() {
        if (dragonBall.collected) return;

        dragonBall.rotation += 0.02;
        dragonBall.pulse += 0.1;

        ctx.save();
        ctx.translate(dragonBall.x, dragonBall.y);
        ctx.rotate(dragonBall.rotation);

        // Glow effect
        const glowSize = 35 + Math.sin(dragonBall.pulse) * 5;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff8c00';
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Dragon Ball body
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ff8c00';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();

        // 4 stars
        ctx.fillStyle = '#ff0000';
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 2) + dragonBall.rotation;
            const starX = Math.cos(angle) * 8;
            const starY = Math.sin(angle) * 8;

            ctx.beginPath();
            ctx.arc(starX, starY, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawAimLine() {
        if (dragging && !goku.launched) {
            const distance = Math.hypot(goku.x - dragStartX, goku.y - dragStartY);
            const power = Math.min(distance / 150, 1);

            // Trajectory prediction
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * power})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);

            ctx.beginPath();
            ctx.moveTo(dragStartX, dragStartY);

            // Predict trajectory with wind
            let predX = dragStartX;
            let predY = dragStartY;
            const deltaX = dragStartX - goku.x;
            const deltaY = dragStartY - goku.y;

            let predVx = 0;
            let predVy = 0;

            if (distance > 5) {
                const currentForce = gameState.superSaiyajin ? superForce : normalForce;
                const force = Math.min(distance / 50, 2) * currentForce;
                predVx = (deltaX / distance) * force;
                predVy = (deltaY / distance) * force;
            }

            for (let i = 0; i < 50; i++) {
                const currentGravity = gameState.superSaiyajin ? superGravity : normalGravity;
                predVy += currentGravity * 0.6;
                predVx += wind.strength * wind.direction; // Wind effect
                predX += predVx;
                predY += predVy;

                if (predY > canvas.height - 40) break;
                if (i % 3 === 0) ctx.lineTo(predX, predY);
            }

            ctx.stroke();
            ctx.setLineDash([]);

            // Power indicator
            ctx.fillStyle = `rgba(248, 201, 39, ${power})`;
            ctx.beginPath();
            ctx.arc(dragStartX, dragStartY, 5 + power * 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawUI() {
        // Active power-ups display
        let yOffset = 150;
        gameState.activePowerUps.forEach(powerUp => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, yOffset, 200, 30);

            ctx.fillStyle = '#f8c927';
            ctx.font = '14px Arial';
            ctx.fillText(`${powerUp.type.toUpperCase()}: ${Math.ceil(powerUp.duration / 60)}s`, 15, yOffset + 20);
            yOffset += 35;
        });

        // Stars display
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px Arial';
        ctx.fillText(`★ ${gameState.totalStars}`, canvas.width - 100, 50);
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();
        drawAimLine();

        // Update game state
        gameState.updatePowerUps();

        // Update Goku
        if (goku.launched) {
            // Add to trail
            goku.trail.push({ x: goku.x, y: goku.y });
            if (goku.trail.length > 20) goku.trail.shift();

            // Add particle trail
            if (Math.random() < 0.3) {
                particleSystem.addTrail(goku.x, goku.y);
            }

            // Physics with wind
            const currentGravity = gameState.superSaiyajin ? superGravity : normalGravity;
            goku.vy += currentGravity * 0.6;
            goku.vx += wind.strength * wind.direction;
            goku.vx *= friction;
            goku.vy *= friction;

            goku.x += goku.vx;
            goku.y += goku.vy;

            // Teto invisível - impede que Goku saia pela parte superior
            if (goku.y - goku.radius < 0) {
                goku.y = goku.radius;
                goku.vy *= -bounceReduction;
                particleSystem.addExplosion(goku.x, goku.y, '#87CEEB');
            }

            // Ground collision
            if (goku.y + goku.radius > canvas.height - 40) {
                goku.y = canvas.height - 40 - goku.radius;
                goku.vy *= -bounceReduction;
                if (Math.abs(goku.vy) > 2) {
                    particleSystem.addExplosion(goku.x, goku.y, '#8B4513');
                }
            }

            // Wall collisions with bouncing
            if (goku.x - goku.radius < 0) {
                goku.x = goku.radius;
                goku.vx *= -bounceReduction;
                particleSystem.addExplosion(goku.x, goku.y, '#8B4513');
            }
            if (goku.x + goku.radius > canvas.width) {
                goku.x = canvas.width - goku.radius;
                goku.vx *= -bounceReduction;
                particleSystem.addExplosion(goku.x, goku.y, '#8B4513');
            }

            // Reset conditions
            const stopThreshold = 1.0;
            if ((Math.abs(goku.vx) < stopThreshold && Math.abs(goku.vy) < stopThreshold && goku.y > canvas.height - 100) ||
                goku.y > canvas.height + 100) {
                resetGoku();
            }
        }

        // Update and draw enemies
        enemies.forEach((enemy) => {
            enemy.update();
            if (!enemy.hit) {
                enemy.draw(ctx);

                // Collision detection
                const dist = Math.hypot(goku.x - enemy.x, goku.y - enemy.y);
                const collisionRadius = goku.radius + (enemy.type === 'boss' ? 35 : 25);

                if (dist < collisionRadius && goku.launched && Math.abs(goku.vx) > 0.5) {
                    enemy.health--;
                    enemy.hitAnimation = 20;

                    if (enemy.health <= 0) {
                        enemy.hit = true;
                        const points = enemy.type === 'boss' ? 500 : 100 * enemy.maxHealth;
                        gameState.addScore(points);
                        particleSystem.addExplosion(enemy.x, enemy.y, '#ff0000', 25);
                        soundManager.play('impact');
                    } else {
                        particleSystem.addExplosion(enemy.x, enemy.y, '#ffff00');
                    }

                    // Bounce Goku away (unless piercing)
                    if (!goku.piercing) {
                        const angle = Math.atan2(goku.y - enemy.y, goku.x - enemy.x);
                        goku.vx = Math.cos(angle) * 6;
                        goku.vy = Math.sin(angle) * 6;
                    }
                }

                // Check projectile collisions with Goku
                enemy.projectiles.forEach((proj, i) => {
                    const projDist = Math.hypot(goku.x - proj.x, goku.y - proj.y);
                    if (projDist < goku.radius + proj.radius && goku.launched) {
                        enemy.projectiles.splice(i, 1);
                        // Damage or effect on Goku
                        particleSystem.addExplosion(goku.x, goku.y, '#ff0000');
                    }
                });
            }
        });

        // Dragon Ball collision
        if (!dragonBall.collected && goku.launched) {
            const dist = Math.hypot(goku.x - dragonBall.x, goku.y - dragonBall.y);
            if (dist < goku.radius + 25) {
                dragonBall.collected = true;
                gameState.dragonBallCollected = true;
                gameState.superSaiyajin = true;
                gameState.addScore(500);

                particleSystem.addTransformation(dragonBall.x, dragonBall.y);
                soundManager.play('transformation');
            }
        }

        // Power-up collisions
        powerUps.forEach((powerUp) => {
            if (!powerUp.collected && goku.launched) {
                const dist = Math.hypot(goku.x - powerUp.x, goku.y - powerUp.y);
                if (dist < goku.radius + powerUp.radius) {
                    powerUp.collected = true;
                    gameState.addPowerUp(powerUp.type);
                    gameState.addScore(200);

                    particleSystem.addExplosion(powerUp.x, powerUp.y, powerUp.effects[powerUp.type].color);
                    soundManager.play('powerup');

                    // Apply immediate effects
                    if (powerUp.type === 'giant') {
                        goku.radius = 35;
                    }
                }
            }

            if (!powerUp.collected) {
                powerUp.update();
                powerUp.draw(ctx);
            }
        });

        // Draw game objects
        drawGoku();
        drawDragonBall();
        drawUI();

        // Update particles
        particleSystem.update(ctx);

        // Check win condition
        if (enemies.every(e => e.hit)) {
            if (!gameState.levelCompleting) {
                gameState.levelCompleting = true;
                setTimeout(() => showLevelComplete(), 1000);
            }
        }

        // Check lose condition (out of shots)
        const allCharactersReady = !goku.launched && gameState.allies.every(ally => !ally.launched);
        if (gameState.shotsUsed >= gameState.maxShots && allCharactersReady && !dragging && enemies.some(e => !e.hit)) {
            if (!gameState.gameOverTriggered) {
                gameState.gameOverTriggered = true;
                setTimeout(() => showGameOver(), 1000);
            }
        }

        animationId = requestAnimationFrame(update);
    }

    function showLevelComplete() {
        const stars = gameState.calculateStars();
        const bonus = Math.max(0, (gameState.maxShots - gameState.shotsUsed) * 50);
        gameState.addScore(bonus);

        document.getElementById('levelScore').textContent = gameState.score;
        document.getElementById('starsEarned').textContent = '★'.repeat(stars);
        document.getElementById('levelComplete').style.display = 'flex';

        cancelAnimationFrame(animationId);
    }

    function showGameOver() {
        document.getElementById('gameOverScore').textContent = gameState.score;
        document.getElementById('gameOver').style.display = 'flex';
        cancelAnimationFrame(animationId);
    }

    function showGameComplete() {
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('finalStars').textContent = gameState.totalStars;
        document.getElementById('gameComplete').style.display = 'flex';
        cancelAnimationFrame(animationId);
    }

    // Initialize game
    defineLevels();
    loadLevel();
    update();

    // Global functions for buttons
    window.nextLevel = function() {
        document.getElementById('levelComplete').style.display = 'none';
        gameState.nextLevel();
        loadLevel();
        update();
    };

    window.resetLevel = function() {
        loadLevel();
    };

    window.restartGame = function() {
        document.getElementById('gameComplete').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        gameState.reset();
        loadLevel();
        update();
    };

    window.toggleSound = function() {
        soundManager.sfxEnabled = !soundManager.sfxEnabled;
        document.getElementById('soundToggle').textContent = soundManager.sfxEnabled ? '🔊' : '🔇';
    };

    window.toggleMusic = function() {
        soundManager.musicEnabled = !soundManager.musicEnabled;
        if (soundManager.musicEnabled) {
            soundManager.playMusic();
        } else {
            soundManager.stopMusic();
        }
        document.getElementById('musicToggle').textContent = soundManager.musicEnabled ? '🎵' : '🔇';
    };
}