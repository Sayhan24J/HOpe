// game.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    color: "blue",
    speed: 5,
    angle: 0,  // Player rotation angle
    bullets: []
};

const keys = {}; // Track movement keys
let shooting = false; // Track shooting state
const bulletCooldown = 200; // Bullet fire rate in milliseconds
let lastBulletTime = 0; // Track last time a bullet was fired

const enemies = [];
const enemySpawnInterval = 2000; // Spawn every 2 seconds
let lastEnemySpawnTime = 0;

// Mouse position for player rotation
let mouseX = 0;
let mouseY = 0;

// Track mouse movement to update the rotation angle
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    // Calculate the angle between the player and the mouse position
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
});

// Start shooting when mouse is down
canvas.addEventListener("mousedown", () => {
    shooting = true;
});

// Stop shooting when mouse is up
canvas.addEventListener("mouseup", () => {
    shooting = false;
});

function spawnEnemy() {
    const size = 20;
    const x = Math.random() * (canvas.width - size);
    const y = -size;
    enemies.push({
        x,
        y,
        width: size,
        height: size,
        color: "red",
        speed: 1.5,
        health: 2
    });
}

function update() {
    // Player movement using both arrow keys and WASD keys
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) player.x += player.speed;

    // Fire bullets if shooting is true and cooldown has passed
    const now = Date.now();
    if (shooting && now - lastBulletTime > bulletCooldown) {
        player.bullets.push({
            x: player.x,
            y: player.y,
            width: 5,
            height: 5,
            angle: player.angle
        });
        lastBulletTime = now; // Reset bullet cooldown timer
    }

    // Move bullets
    player.bullets = player.bullets.filter(bullet => bullet.y > 0 && bullet.y < canvas.height);
    player.bullets.forEach(bullet => {
        bullet.x += Math.cos(bullet.angle) * 10;
        bullet.y += Math.sin(bullet.angle) * 10;
    });

    // Move enemies toward the player
    enemies.forEach((enemy, index) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }

        // Check if any bullet hits the enemy
        player.bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x > enemy.x &&
                bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y &&
                bullet.y < enemy.y + enemy.height
            ) {
                enemy.health -= 1;
                player.bullets.splice(bulletIndex, 1); // Remove bullet on hit

                // Remove enemy if health is 0
                if (enemy.health <= 0) {
                    enemies.splice(index, 1);
                }
            }
        });
    });

    // Spawn enemies over time
    if (now - lastEnemySpawnTime > enemySpawnInterval) {
        spawnEnemy();
        lastEnemySpawnTime = now;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player with rotation
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = player.color;
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();

    // Draw bullets
    ctx.fillStyle = "yellow";
    player.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies with health bar
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Draw health bar above enemy
        ctx.fillStyle = "green";
        ctx.fillRect(enemy.x, enemy.y - 10, (enemy.width * enemy.health) / 3, 5);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Handle player movement with both arrow keys and WASD keys
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

gameLoop();
