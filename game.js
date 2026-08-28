// ===== FANTASY SHOOTER - 10 LEVEL CAMPAIGN =====
// Multi-level action shooter with progressive difficulty and mega boss

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Level themes
const levels = [
    { name: 'Castle Grounds', color1: '#4a0080', color2: '#1a0033', enemyColor: '#00cc00' },
    { name: 'Dark Forest', color1: '#2d5016', color2: '#0a1a06', enemyColor: '#ff6b9d' },
    { name: 'Lava Dungeon', color1: '#4a2a1a', color2: '#1a0a06', enemyColor: '#ff6b9d' },
    { name: 'Crystal Cavern', color1: '#1a3a4a', color2: '#0a1a2a', enemyColor: '#00ffff' },
    { name: 'Sky Fortress', color1: '#2a4a6a', color2: '#0a1a3a', enemyColor: '#ffff00' },
    { name: 'Shadow Realm', color1: '#2a1a4a', color2: '#0a0a1a', enemyColor: '#ff00ff' },
    { name: 'Infernal Pit', color1: '#5a2a1a', color2: '#2a0a06', enemyColor: '#ff3333' },
    { name: 'Void Prison', color1: '#1a1a3a', color2: '#05050a', enemyColor: '#00ff88' },
    { name: 'Celestial Tower', color1: '#3a4a6a', color2: '#1a2a4a', enemyColor: '#ffaa00' },
    { name: 'Nexus Core', color1: '#4a1a4a', color2: '#1a0a1a', enemyColor: '#ff00ff' }
];

// Game state
const game = {
    score: 0,
    level: 1,
    wave: 1,
    gameOver: false,
    paused: false,
    levelComplete: false,
    enemiesKilled: 0,
    isBossFight: false,
    gameWon: false
};

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    health: 150,
    maxHealth: 150,
    mana: 150,
    maxMana: 150,
    manaRegen: 0.15, // Reduced mana drain
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
let boss = null;

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

    // Mana regeneration (slower)
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
    if (player.shootCooldown <= 0 && player.mana >= 12 && !game.gameOver && !game.levelComplete) {
        projectiles.push({
            x: player.x,
            y: player.y - 20,
            vx: 0,
            vy: -8,
            width: 12,
            height: 12,
            damage: 25 + (game.level * 5),
            life: 120
        });
        player.mana -= 12;
        player.shootCooldown = 10;
        createParticles(player.x, player.y, '#ff6b9d', 5);
    }
}

// Dodge/dash mechanic
function dodge() {
    if (player.dodgeCooldown <= 0 && !game.gameOver && !game.levelComplete) {
        player.isDodging = true;
        player.dodgeTimer = player.dodgeDuration;
        player.dodgeCooldown = 60;
        createParticles(player.x, player.y, '#00ff88', 10);
    }
}

// Spawn regular enemies
function spawnWave() {
    const baseEnemyCount = 3 + game.wave + (game.level - 1) * 2;
    const enemyTypes = ['goblin', 'wizard', 'demon'];
    
    for (let i = 0; i < baseEnemyCount; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const x = Math.random() * (canvas.width - 60) + 30;
        
        let stats = {
            goblin: { health: 30, speed: 2, shootInterval: 80, damage: 10, size: 30 },
            wizard: { health: 50, speed: 1.5, shootInterval: 60, damage: 15, size: 35 },
            demon: { health: 80, speed: 1, shootInterval: 100, damage: 20, size: 40 }
        };
        
        let stat = stats[type];
        
        let enemy = {
            x: x,
            y: -30,
            width: stat.size + (game.level * 2),
            height: stat.size + (game.level * 2),
            type: type,
            health: stat.health + (game.level * 10),
            maxHealth: stat.health + (game.level * 10),
            speed: stat.speed + (game.level * 0.1),
            shootCooldown: Math.random() * 60 + 40 - (game.level * 5),
            shootInterval: stat.shootInterval - (game.level * 5),
            damage: stat.damage + (game.level * 2)
        };
        enemies.push(enemy);
    }
}

// Spawn mega boss (Level 10)
function spawnMegaBoss() {
    boss = {
        x: canvas.width / 2,
        y: 100,
        width: 80,
        height: 80,
        type: 'megaboss',
        health: 500,
        maxHealth: 500,
        speed: 1.2,
        shootCooldown: 0,
        shootInterval: 30,
        damage: 30,
        phase: 1,
        moveDirection: 1,
        attackPattern: 'spiral'
    };
    game.isBossFight = true;
}

// Update mega boss
function updateBoss() {
    if (!boss) return;

    // Move side to side
    boss.x += boss.speed * boss.moveDirection;
    if (boss.x < 100 || boss.x > canvas.width - 100) {
        boss.moveDirection *= -1;
    }

    // Boss shoots multiple patterns
    boss.shootCooldown--;
    if (boss.shootCooldown <= 0) {
        if (boss.attackPattern === 'spiral') {
            // Spiral attack pattern
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                enemyProjectiles.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * 5,
                    vy: Math.sin(angle) * 5,
                    width: 10,
                    height: 10,
                    damage: boss.damage,
                    life: 200
                });
            }
        } else if (boss.attackPattern === 'laser') {
            // Laser pattern at player
            const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
            for (let i = 0; i < 3; i++) {
                enemyProjectiles.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle + (i - 1) * 0.3) * 6,
                    vy: Math.sin(angle + (i - 1) * 0.3) * 6,
                    width: 12,
                    height: 12,
                    damage: boss.damage,
                    life: 200
                });
            }
        }
        boss.shootCooldown = boss.shootInterval;
    }

    // Phase change at 2/3 health
    if (boss.health < boss.maxHealth * 0.66 && boss.phase === 1) {
        boss.phase = 2;
        boss.speed = 1.8;
        boss.attackPattern = 'laser';
        boss.shootInterval = 25;
    }
    
    // Phase change at 1/3 health
    if (boss.health < boss.maxHealth * 0.33 && boss.phase === 2) {
        boss.phase = 3;
        boss.speed = 2.2;
        boss.shootInterval = 20;
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

        // Check collision with boss
        if (boss && checkCollision(proj, boss)) {
            boss.health -= proj.damage;
            projectiles.splice(i, 1);
            createParticles(boss.x, boss.y, '#ffaa00', 15);
            continue;
        }

        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(proj, enemies[j])) {
                enemies[j].health -= proj.damage;
                if (enemies[j].health <= 0) {
                    game.score += 100 + (game.level * 50);
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
        p.vy += 0.1;

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
    
    ctx.fillStyle = '#6b3fa0';
    ctx.fillRect(player.x - 20, player.y - 10, 40, 40);
    
    ctx.fillStyle = '#9d5fff';
    ctx.beginPath();
    ctx.moveTo(player.x - 15, player.y - 10);
    ctx.lineTo(player.x + 15, player.y - 10);
    ctx.lineTo(player.x, player.y - 25);
    ctx.closePath();
    ctx.fill();
    
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
        ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2, enemy.width, enemy.height);
        
        // Health bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2 - 8, enemy.width, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2 - 8, (enemy.health / enemy.maxHealth) * enemy.width, 4);
    });
}

function drawBoss() {
    if (!boss) return;
    
    // Boss body
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(boss.x - boss.width/2, boss.y - boss.height/2, boss.width, boss.height);
    
    // Boss eyes
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(boss.x - 20, boss.y - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(boss.x + 20, boss.y - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Health bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(canvas.width/2 - 150, 20, 300, 15);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(canvas.width/2 - 150, 20, (boss.health / boss.maxHealth) * 300, 15);
    
    // Phase indicator
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MEGA BOSS - Phase ' + boss.phase, canvas.width/2, 60);
}

function drawProjectiles() {
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
    document.getElementById('waveNumber').textContent = game.isBossFight ? 'BOSS' : game.wave;
    document.getElementById('enemyCount').textContent = game.isBossFight ? (boss ? '1' : '0') : enemies.length;
    document.getElementById('levelDisplay').textContent = 'Level ' + game.level + ': ' + levels[game.level - 1].name;
}

// Main game loop
function gameLoop() {
    const currentLevel = levels[game.level - 1];
    
    if (!game.gameOver && !game.paused && !game.levelComplete) {
        updatePlayer();
        
        if (game.isBossFight) {
            updateBoss();
            updateProjectiles();
            updateParticles();
            
            // Check if boss is defeated
            if (boss && boss.health <= 0) {
                game.levelComplete = true;
                game.gameWon = true;
                showGameWon();
            }
        } else {
            updateEnemies();
            updateProjectiles();
            updateParticles();

            // Spawn new waves
            if (enemies.length === 0 && projectiles.length === 0) {
                game.wave++;
                if (game.wave > 3) {
                    // All waves done, next level
                    nextLevel();
                } else {
                    spawnWave();
                }
            }
        }

        // Check game over
        if (player.health <= 0) {
            game.gameOver = true;
            showGameOver();
        }
    }

    // Clear canvas with level color
    ctx.fillStyle = currentLevel.color1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = currentLevel.color2;
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(i * 200, i * 120 % canvas.height, 100, 50);
    }

    // Draw everything
    drawProjectiles();
    drawParticles();
    if (game.isBossFight) {
        drawBoss();
    } else {
        drawEnemies();
    }
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

function nextLevel() {
    if (game.level < 10) {
        game.level++;
        game.wave = 1;
        game.levelComplete = false;
        player.health = player.maxHealth;
        player.mana = player.maxMana;
        enemies = [];
        projectiles = [];
        enemyProjectiles = [];
        particles = [];
        
        // Level 10 is boss fight
        if (game.level === 10) {
            spawnMegaBoss();
        } else {
            spawnWave();
        }
    }
}

function showGameOver() {
    document.getElementById('gameOverScreen').classList.add('active');
    document.getElementById('gameOverText').textContent = 'LEVEL ' + game.level + ' - DEFEATED';
    document.getElementById('finalScore').textContent = 'Final Score: ' + game.score;
}

function showGameWon() {
    document.getElementById('gameOverScreen').classList.add('active');
    document.getElementById('gameOverText').textContent = '🎉 YOU WIN! 🎉';
    document.getElementById('finalScore').textContent = 'Final Score: ' + game.score + '\nAll 10 Levels Conquered!';
}

// Start the game
spawnWave();
gameLoop();