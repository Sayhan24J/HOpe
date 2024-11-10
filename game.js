const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    color: "blue",
    speed: 5,
    angle: 0,
    bullets: []
};

const keys = {}; // Track keyboard keys
let shooting = false;
const bulletCooldown = 200; // Bullet fire rate in milliseconds
let lastBulletTime = 0;
const enemies = [];
const enemySpawnInterval = 2000; // 2 seconds
let lastEnemySpawnTime = 0;

// Variables for touch controls
let touchX = null;
let touchY = null;

// Resize canvas to fit screen
function resizeCanvas() {
    const scale = Math.min(window.innerWidth / 800, window.innerHeight / 600);
    canvas.width = 800 * scale;
    canvas.height = 600 * scale;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial sizing

// Handle mouse movement to rotate player
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
});

// Handle shooting with mouse
canvas.addEventListener("mousedown", () => { shooting = true; });
canvas.addEventListener("mouseup", () => { shooting = false; });

// Handle touch start for movement and shooting
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchX = touch.clientX - rect.left;
    touchY = touch.clientY - rect.top;
    shooting = true;
});

// Handle touch move to update direction
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchX = touch.clientX - rect.left;
    touchY = touch.clientY - rect.top;
    player.angle = Math.atan2(touchY - player.y, touchX - player.x);
});

// Stop shooting on touch end
canvas.addEventListener("touchend", () => { shooting = false; });

// Spawn enemies periodically
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

// Main update function
function update() {
    const now = Date.now();

    // Update player position (keyboard)
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) player.x += player.speed;

    // Limit player movement within canvas boundaries
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));

    // Fire bullets when shooting
    if (shooting && now - lastBulletTime > bulletCooldown) {
        player.bullets.push({
            x: player.x,
            y: player.y,
            width: 5,
            height: 5,
            angle: player.angle
        });
        lastBulletTime = now;
    }

    // Move bullets and remove out-of-bounds ones
    player.bullets = player.bullets.filter(bullet => bullet.y > 0 && bullet.y < canvas.height);
    player.bullets.forEach(bullet => {
        bullet.x += Math.cos(bullet.angle) * 10;
        bullet.y += Math.sin(bullet.angle) * 10;
    });

    // Move enemies toward player and handle collisions
    enemies.forEach((enemy, index) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }

        // Check bullet collision with enemy
        player.bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x > enemy.x &&
                bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y &&
                bullet.y < enemy.y + enemy.height
            ) {
                enemy.health -= 1;
                player.bullets.splice(bulletIndex, 1);
                if (enemy.health <= 0) enemies.splice(index, 1);
            }
        });
    });

    // Spawn enemies at intervals
    if (now - lastEnemySpawnTime > enemySpawnInterval) {
        spawnEnemy();
        lastEnemySpawnTime = now;
    }
}

// Draw function to render player, bullets, and enemies
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
        ctx.fillStyle = "green";
        ctx.fillRect(enemy.x, enemy.y - 10, (enemy.width * enemy.health) / 2, 5);
    });
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Handle keyboard controls
document.addEventListener("keydown", (e) => { keys[e.key] = true; });
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// Start game
gameLoop();
