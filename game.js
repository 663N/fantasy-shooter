// ===== FANTASY SHOOTER - Battle Arena =====
// Medium difficulty action shooter with magic spells

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
const game = {
    score: 0,
    wave: 1,
    gameOver: false,
    paused: false,
    enemiesKilled: 0
};

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    health: 100,
    maxHealth: 100,
    mana: 100,
    maxMana: 100,
    manaRegen: 0.3,
    speed: 5,
    shootCooldown: 0,
    isDodging: false,
    dodgeCooldown: 0,
    dodgeDuration: 10,
    dodgeTimer: 0
};

// Arrays for game objects
let projectiles = [];
let enemies = [];
let particles = [];
let enemyProjectiles = [];

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
        e.preventDefault();
        shootFireball();
    }
    if (e.key.toLowerCase() === 'shift') {
        dodge();
    }
    if (e.key === 'Escape') {
        game.paused = !game.paused;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Player movement
function updatePlayer() {
    // Move left/right
    if (keys['arrowleft'] || keys['a']) {
        player.x -= player.speed;
    }
    if (keys['arrowright'] || keys['d']) {
        player.x += player.speed;
    }
    
    // Move up/down
    if (keys['arrowup'] || keys['w']) {
        player.y -= player.speed;
    }
    if (keys['arrowdown'] || keys['s']) {
        player.y += player.speed;
    }

    // Boundary check
    player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
    player.y = Math.max(20, Math.min(canvas.height - 20, player.y));

    // Mana regeneration
    if (player.mana < player.maxMana) {
        player.mana += player.manaRegen;
    }

    // Dodge cooldown
    if (player.dodgeCooldown > 0) player.dodgeCooldown--;
    
    // Update dodge status
    if (player.isDodging) {
        player.dodgeTimer--;
        if (player.dodgeTimer <= 0) {
            player.isDodging = false;
        }
    }

    // Shoot cooldown
    if (player.shootCooldown > 0) player.shootCooldown--;
}

// Shooting mechanic
function shootFireball() {
    if (player.shootCooldown <= 0 && player.mana >= 15 && !game.gameOver) {
        projectiles.push({
            x: player.x,
            y: player.y - 20,
            vx: 0,
            vy: -8,
            width: 12,
            height: 12,
            damage: 25,
            life: 120
        });
        player.mana -= 15;
        player.shootCooldown = 10;
        createParticles(player.x, player.y, '#ff6b9d', 5);
    }
}

// Dodge/dash mechanic
function dodge() {
    if (player.dodgeCooldown <= 0 && !game.gameOver) {
        player.isDodging = true;
        player.dodgeTimer = player.dodgeDuration;
        player.dodgeCooldown = 60;
        createParticles(player.x, player.y, '#00ff88', 10);
    }
}

// Enemy spawning
function spawnWave() {
    const enemyCount = 3 + game.wave;
    const enemyTypes = ['goblin', 'wizard', 'demon'];
    
    for (let i = 0; i < enemyCount; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const x = Math.random() * (canvas.width - 60) + 30;
        
        let enemy = {
            x: x,
            y: -30,
            width: 30,
            height: 30,
            type: type,
            health: type === 'goblin' ? 30 : type === 'wizard' ? 50 : 80,
            maxHealth: type === 'goblin' ? 30 : type === 'wizard' ? 50 : 80,
            speed: type === 'goblin' ? 2 : type === 'wizard' ? 1.5 : 1,
            shootCooldown: Math.random() * 60 + 40,
            shootInterval: type === 'goblin' ? 80 : type === 'wizard' ? 60 : 100,
            damage: type === 'goblin' ? 10 : type === 'wizard' ? 15 : 20
        };
        enemies.push(enemy);
    }
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Move toward player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }

        // Shoot at player
        enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0) {
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemyProjectiles.push({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                width: 8,
                height: 8,
                damage: enemy.damage,
                life: 200
            });
            enemy.shootCooldown = enemy.shootInterval;
        }

        // Remove if out of bounds
        if (enemy.y > canvas.height + 50) {
            enemies.splice(i, 1);
            continue;
        }

        // Check collision with player
        if (checkCollision(player, enemy) && !player.isDodging) {
            player.health -= 5;
            enemies.splice(i, 1);
            createParticles(enemy.x, enemy.y, '#ff0000', 8);
        }
    }
}

// Update projectiles
function updateProjectiles() {
    // Player projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;

        if (proj.y < 0 || proj.life <= 0) {
            projectiles.splice(i, 1);
            continue;
        }

        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(proj, enemies[j])) {
                enemies[j].health -= proj.damage;
                if (enemies[j].health <= 0) {
                    game.score += 100 + (game.wave * 50);
                    game.enemiesKilled++;
                    createParticles(enemies[j].x, enemies[j].y, '#ffaa00', 12);
                    enemies.splice(j, 1);
                }
                projectiles.splice(i, 1);
                break;
            }
        }
    }

    // Enemy projectiles
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const proj = enemyProjectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;

        if (proj.y > canvas.height || proj.life <= 0) {
            enemyProjectiles.splice(i, 1);
            continue;
        }

        // Check collision with player
        if (checkCollision(proj, player) && !player.isDodging) {
            player.health -= proj.damage;
            enemyProjectiles.splice(i, 1);
            createParticles(player.x, player.y, '#ff0000', 8);
        }
    }
}

// Particle effects
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 30,
            maxLife: 30,
            color: color,
            size: Math.random() * 3 + 2
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.vy += 0.1; // Gravity

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Collision detection
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Drawing functions
function drawPlayer() {
    ctx.save();
    ctx.globalAlpha = player.isDodging ? 0.5 : 1;
    
    // Draw wizard robe
    ctx.fillStyle = '#6b3fa0';
    ctx.fillRect(player.x - 20, player.y - 10, 40, 40);
    
    // Draw hat
    ctx.fillStyle = '#9d5fff';
    ctx.beginPath();
    ctx.moveTo(player.x - 15, player.y - 10);
    ctx.lineTo(player.x + 15, player.y - 10);
    ctx.lineTo(player.x, player.y - 25);
    ctx.closePath();
    ctx.fill();
    
    // Draw eyes (glowing if dodging)
    ctx.fillStyle = player.isDodging ? '#00ff88' : '#ffff00';
    ctx.beginPath();
    ctx.arc(player.x - 8, player.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 8, player.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.type === 'goblin' ? '#00cc00' : 
                       enemy.type === 'wizard' ? '#ff6b9d' : '#ff0000';
        ctx.fillRect(enemy.x - 15, enemy.y - 15, 30, 30);
        
        // Health bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x - 15, enemy.y - 22, 30, 3);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x - 15, enemy.y - 22, (enemy.health / enemy.maxHealth) * 30, 3);
    });
}

function drawProjectiles() {
    // Player fireballs
    projectiles.forEach(proj => {
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Enemy projectiles
    enemyProjectiles.forEach(proj => {
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(proj.x - 4, proj.y - 4, 8, 8);
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function updateHUD() {
    document.getElementById('healthValue').textContent = Math.max(0, Math.floor(player.health));
    document.getElementById('scoreValue').textContent = game.score;
    document.getElementById('manaValue').textContent = Math.floor(player.mana) + '/' + player.maxMana;
    document.getElementById('waveNumber').textContent = game.wave;
    document.getElementById('enemyCount').textContent = enemies.length;
}

// Main game loop
function gameLoop() {
    if (!game.gameOver && !game.paused) {
        // Update
        updatePlayer();
        updateEnemies();
        updateProjectiles();
        updateParticles();

        // Spawn new waves
        if (enemies.length === 0 && projectiles.length === 0) {
            game.wave++;
            spawnWave();
        }

        // Check game over
        if (player.health <= 0) {
            game.gameOver = true;
            showGameOver();
        }
    }

    // Clear canvas
    ctx.fillStyle = 'rgba(10, 0, 21, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw everything
    drawProjectiles();
    drawParticles();
    drawEnemies();
    drawPlayer();

    // Draw pause text
    if (game.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff6b9d';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }

    updateHUD();
    requestAnimationFrame(gameLoop);
}

function showGameOver() {
    document.getElementById('gameOverScreen').classList.add('active');
    document.getElementById('finalScore').textContent = 'Final Score: ' + game.score + '\nWave Reached: ' + game.wave;
}

// Start the game
spawnWave();
gameLoop();