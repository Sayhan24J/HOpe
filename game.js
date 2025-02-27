const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game State
let gameState = "menu"; // "menu", "playing", "gameover"
let score = 0;
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    color: "blue",
    speed: 5,
    angle: 0,
    bullets: [],
    health: 3 // Player Health
};

const keys = {};
let shooting = false;
const bulletCooldown = 200;
let lastBulletTime = 0;
const enemies = [];
const enemySpawnInterval = 2000;
let lastEnemySpawnTime = 0;

// Start Game Button
canvas.addEventListener("click", () => {
    if (gameState === "menu") {
        gameState = "playing";
        score = 0;
        player.health = 3;
        enemies.length = 0;
    }
});

// Enemy Spawner
function spawnEnemy() {
    const size = 20;
    const x = Math.random() * (canvas.width - size);
    const y = -size;
    enemies.push({
        x, y, width: size, height: size, color: "red", speed: 1.5, health: 2
    });
}

// Update function
function update() {
    if (gameState !== "playing") return;
    const now = Date.now();

    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;
    
    if (shooting && now - lastBulletTime > bulletCooldown) {
        player.bullets.push({
            x: player.x, y: player.y, width: 5, height: 5, angle: player.angle
        });
        lastBulletTime = now;
    }

    player.bullets.forEach(bullet => {
        bullet.x += Math.cos(bullet.angle) * 10;
        bullet.y += Math.sin(bullet.angle) * 10;
    });

    enemies.forEach((enemy, index) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }

        player.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                enemy.health -= 1;
                player.bullets.splice(bulletIndex, 1);
                if (enemy.health <= 0) {
                    enemies.splice(index, 1);
                    score += 10;
                }
            }
        });

        if (distance < 15) {
            player.health -= 1;
            enemies.splice(index, 1);
            if (player.health <= 0) gameState = "gameover";
        }
    });

    if (now - lastEnemySpawnTime > enemySpawnInterval) {
        spawnEnemy();
        lastEnemySpawnTime = now;
    }
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Click to Start", canvas.width / 2 - 70, canvas.height / 2);
        return;
    }

    if (gameState === "gameover") {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over! Click to Restart", canvas.width / 2 - 140, canvas.height / 2);
        return;
    }

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = "yellow";
    player.bullets.forEach(bullet => ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height));
    
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Health: " + player.health, 10, 40);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => { keys[e.key] = true; });
document.addEventListener("keyup", (e) => { keys[e.key] = false; });
canvas.addEventListener("mousedown", () => { shooting = true; });
canvas.addEventListener("mouseup", () => { shooting = false; });

gameLoop();
