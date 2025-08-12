
// src/js/arcade/invaders.js
export class InvadersGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Game state
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('invaders-highscore')) || 0;
        this.lives = 3;
        this.level = 1;
        this.endless = false; // toggleable

        // Timing
        this.lastTime = 0;
        this.enemyShotTimer = 0;
        this.shotCooldown = 300; // ms cooldown
        this.lastShot = 0;

        // Control
        this.keys = {};
        this.paused = false;

        this.reset();
        this.bindControls();
    }

    reset() {
        this.player = {
            x: this.canvas.width / 2 - 20,
            y: this.canvas.height - 40,
            width: 40,
            height: 20,
            speed: 250,
            shield: false
        };

        this.bullets = [];
        this.enemyBullets = [];
        this.explosions = [];
        this.powerUps = [];

        this.createInvaders();
        this.lives = 3;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
    }

    createInvaders(boss = false) {
        this.invaders = [];
        if (boss) {
            this.invaders.push({
                x: this.canvas.width / 2 - 60,
                y: 50,
                width: 120,
                height: 60,
                speed: 50,
                hp: 20,
                type: "boss",
                direction: 1
            });
            return;
        }

        const rows = 5;
        const cols = 10;
        const spacing = 50;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.invaders.push({
                    x: col * spacing + 50,
                    y: row * spacing + 40,
                    width: 35,
                    height: 25,
                    speed: 40 + this.level * 5,
                    hp: 1,
                    type: row,
                    direction: 1
                });
            }
        }
    }

    bindControls() {
        document.addEventListener("keydown", e => {
            this.keys[e.key] = true;
            if (e.key === " " && !this.paused && !this.gameOver) {
                this.shoot();
            }
            if (e.key.toLowerCase() === "p") {
                this.paused = !this.paused;
            }
            if (this.gameOver && e.key === "Enter") {
                this.reset();
            }
        });

        document.addEventListener("keyup", e => {
            this.keys[e.key] = false;
        });
    }

    shoot() {
        const now = performance.now();
        if (now - this.lastShot < this.shotCooldown) return;
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 15,
            speed: 400
        });
        this.lastShot = now;
    }

    enemyShoot() {
        const shooters = this.invaders.filter(inv =>
            !this.invaders.some(other => other.y > inv.y && Math.abs(other.x - inv.x) < 40)
        );
        if (shooters.length === 0) return;
        const shooter = shooters[Math.floor(Math.random() * shooters.length)];
        this.enemyBullets.push({
            x: shooter.x + shooter.width / 2 - 2,
            y: shooter.y + shooter.height,
            width: 4,
            height: 15,
            speed: 200
        });
    }

    spawnPowerUp(x, y) {
        const types = ["shield", "rapid", "double"];
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerUps.push({ x, y, width: 20, height: 20, type, speed: 80 });
    }

    update(delta) {
        if (this.gameOver || this.paused) return;

        // Player movement
        if (this.keys["ArrowLeft"]) this.player.x -= this.player.speed * delta;
        if (this.keys["ArrowRight"]) this.player.x += this.player.speed * delta;
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));

        // Bullets
        this.bullets.forEach(b => b.y -= b.speed * delta);
        this.bullets = this.bullets.filter(b => b.y > 0);

        this.enemyBullets.forEach(b => b.y += b.speed * delta);
        this.enemyBullets = this.enemyBullets.filter(b => {
            if (this.checkCollision(b, this.player)) {
                if (this.player.shield) {
                    this.player.shield = false;
                } else {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.endGame();
                    }
                }
                return false;
            }
            return b.y < this.canvas.height;
        });

        // Invaders
        let touchedEdge = false;
        this.invaders.forEach(inv => {
            inv.x += inv.direction * inv.speed * delta;
            if (inv.x <= 0 || inv.x + inv.width >= this.canvas.width) touchedEdge = true;
        });
        if (touchedEdge) {
            this.invaders.forEach(inv => {
                inv.direction *= -1;
                inv.y += 20;
            });
        }

        // Bullets hitting invaders
        this.bullets = this.bullets.filter(b => {
            for (let i = 0; i < this.invaders.length; i++) {
                if (this.checkCollision(b, this.invaders[i])) {
                    this.invaders[i].hp--;
                    if (this.invaders[i].hp <= 0) {
                        this.explosions.push({ x: this.invaders[i].x, y: this.invaders[i].y, life: 0.3 });
                        if (Math.random() < 0.1) this.spawnPowerUp(this.invaders[i].x, this.invaders[i].y);
                        this.score += this.invaders[i].type === "boss" ? 500 : 50;
                        this.invaders.splice(i, 1);
                    }
                    return false;
                }
            }
            return true;
        });

        // Power-Ups
        this.powerUps.forEach(p => p.y += p.speed * delta);
        this.powerUps = this.powerUps.filter(p => {
            if (this.checkCollision(p, this.player)) {
                if (p.type === "shield") this.player.shield = true;
                if (p.type === "rapid") this.shotCooldown = 100;
                if (p.type === "double") {
                    // shoot twice
                    this.shoot = () => {
                        const now = performance.now();
                        if (now - this.lastShot < this.shotCooldown) return;
                        this.bullets.push({ x: this.player.x + 5, y: this.player.y, width: 4, height: 15, speed: 400 });
                        this.bullets.push({ x: this.player.x + this.player.width - 9, y: this.player.y, width: 4, height: 15, speed: 400 });
                        this.lastShot = now;
                    };
                }
                return false;
            }
            return p.y < this.canvas.height;
        });

        // Enemy shooting timer
        this.enemyShotTimer += delta * 1000;
        if (this.enemyShotTimer > 800) {
            this.enemyShoot();
            this.enemyShotTimer = 0;
        }

        // Level progression
        if (this.invaders.length === 0) {
            this.level++;
            if (this.level % 3 === 0) this.createInvaders(true);
            else this.createInvaders();
        }
    }

    draw() {
        // Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Player
        this.ctx.fillStyle = this.player.shield ? "cyan" : "lime";
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Bullets
        this.ctx.fillStyle = "yellow";
        this.bullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.width, b.height));

        // Enemy bullets
        this.ctx.fillStyle = "red";
        this.enemyBullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.width, b.height));

        // Invaders
        this.invaders.forEach(inv => {
            this.ctx.fillStyle = inv.type === "boss" ? "orange" : ["red", "green", "blue", "purple", "pink"][inv.type % 5];
            this.ctx.fillRect(inv.x, inv.y, inv.width, inv.height);
        });

        // Power-Ups
        this.powerUps.forEach(p => {
            this.ctx.fillStyle = p.type === "shield" ? "cyan" : p.type === "rapid" ? "gold" : "white";
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
        });

        // Explosions
        this.explosions.forEach(ex => {
            this.ctx.fillStyle = "orange";
            this.ctx.beginPath();
            this.ctx.arc(ex.x, ex.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // HUD
        this.ctx.fillStyle = "white";
        this.ctx.font = "16px Arial";
        this.ctx.fillText(`Score: ${this.score}`, 10, 20);
        this.ctx.fillText(`High: ${this.highScore}`, 10, 40);
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 60);
        this.ctx.fillText(`Level: ${this.level}`, 10, 80);
        this.ctx.fillText(`P: Pause`, this.canvas.width - 80, 20);

        if (this.gameOver) {
            this.ctx.fillStyle = "rgba(0,0,0,0.7)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "white";
            this.ctx.font = "32px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = "20px Arial";
            this.ctx.fillText("Press Enter to Restart", this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    endGame() {
        this.gameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem("invaders-highscore", this.score);
        }
    }

    start() {
        const loop = (time) => {
            const delta = (time - this.lastTime) / 1000;
            this.lastTime = time;
            this.update(delta);
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}












