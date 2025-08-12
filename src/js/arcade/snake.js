
// src/js/arcade/snake.js
export class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Standard-Einstellungen
        this.gridSize = 20;
        this.baseSpeed = 6;
        this.levelUpEvery = 50;
        this.obstaclesEnabled = true;

        // Spielvariablen
        this.score = 0;
        this.level = 1;
        this.highScore = parseInt(localStorage.getItem('snake-highscore')) || 0;
        this.gameOver = false;
        this.paused = false;
        this.infinityMode = false; // Wrap-around

        // Skin & Frucht-Einstellungen
        this.availableSkins = ["classic", "neon", "rainbow", "blue"];
        this.skinIndex = 0;
        this.availableFruitSets = ["classic", "gold", "mix"];
        this.fruitIndex = 0;

        this.lastTime = 0;
        this.accumulator = 0;
        this.speed = this.baseSpeed;

        // Spielstatus: "menu" | "playing" | "gameover"
        this.state = "menu";

        this.bindControls();
    }

    reset() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.level = 1;
        this.speed = this.baseSpeed;
        this.gameOver = false;
        this.paused = false;
        this.food = this.generateFood();
        this.obstacles = [];
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (this.state === "menu" && e.key === "Enter") {
                this.startGame();
                return;
            }
            if (this.gameOver && e.key === "Enter") {
                this.state = "menu";
                return;
            }
            if (e.key.toLowerCase() === 'p' && this.state === "playing") {
                this.paused = !this.paused;
                return;
            }
            if (this.state === "playing") {
                switch (e.key) {
                    case 'ArrowUp': if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 }; break;
                    case 'ArrowDown': if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 }; break;
                    case 'ArrowLeft': if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 }; break;
                    case 'ArrowRight': if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 }; break;
                }
            }
        });
    }

    startGame() {
        this.reset();
        this.state = "playing";
    }

    // ------------------------------
    // Einstellungen im Menü
    // ------------------------------
    changeSkin() {
        this.skinIndex = (this.skinIndex + 1) % this.availableSkins.length;
    }
    changeFruitSet() {
        this.fruitIndex = (this.fruitIndex + 1) % this.availableFruitSets.length;
    }
    toggleInfinityMode() {
        this.infinityMode = !this.infinityMode;
    }

    // ------------------------------
    // Spiel-Logik
    // ------------------------------
    generateFood() {
        const set = this.availableFruitSets[this.fruitIndex];
        let fruitTypes = [];
        if (set === "classic") fruitTypes = [{ color: 'red', points: 10 }];
        if (set === "gold") fruitTypes = [{ color: 'gold', points: 50 }];
        if (set === "mix") fruitTypes = [
            { color: 'red', points: 10 },
            { color: 'gold', points: 50 },
            { color: 'purple', points: 25 }
        ];

        let type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)),
                type
            };
        } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
        return pos;
    }

    generateObstacles(count) {
        this.obstacles = [];
        for (let i = 0; i < count; i++) {
            let pos;
            do {
                pos = {
                    x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                    y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
                };
            } while (
                this.snake.some(s => s.x === pos.x && s.y === pos.y) ||
                (this.food && pos.x === this.food.x && pos.y === this.food.y)
            );
            this.obstacles.push(pos);
        }
    }

    checkCollision(head) {
        if (!this.infinityMode &&
            (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
             head.y < 0 || head.y >= this.canvas.height / this.gridSize)) {
            return true;
        }
        if (this.infinityMode) {
            if (head.x < 0) head.x = (this.canvas.width / this.gridSize) - 1;
            else if (head.x >= this.canvas.width / this.gridSize) head.x = 0;
            if (head.y < 0) head.y = (this.canvas.height / this.gridSize) - 1;
            else if (head.y >= this.canvas.height / this.gridSize) head.y = 0;
        }
        if (this.snake.some(s => s.x === head.x && s.y === head.y)) return true;
        if (this.obstacles.some(o => o.x === head.x && o.y === head.y)) return true;
        return false;
    }

    update(dt) {
        if (this.state !== "playing" || this.gameOver || this.paused) return;
        this.accumulator += dt;
        const step = 1 / this.speed;

        while (this.accumulator > step) {
            this.accumulator -= step;
            this.direction = this.nextDirection;
            const head = {
                x: this.snake[0].x + this.direction.x,
                y: this.snake[0].y + this.direction.y
            };
            if (this.checkCollision(head)) {
                this.gameOver = true;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('snake-highscore', this.score);
                }
                return;
            }
            this.snake.unshift(head);

            if (head.x === this.food.x && head.y === this.food.y) {
                this.score += this.food.type.points;
                this.food = this.generateFood();
                if (this.score >= this.level * this.levelUpEvery) {
                    this.level++;
                    this.speed += 1;
                    if (this.obstaclesEnabled) {
                        this.generateObstacles(this.level - 2);
                    }
                }
            } else {
                this.snake.pop();
            }
        }
    }

    drawSnakeSegment(segment, index) {
        let color;
        const skin = this.availableSkins[this.skinIndex];
        if (skin === "classic") color = "lime";
        if (skin === "blue") color = "cyan";
        if (skin === "neon") color = `hsl(${(index * 10) % 360}, 100%, 50%)`;
        if (skin === "rainbow") color = `hsl(${(Date.now() / 10 + index * 15) % 360}, 100%, 50%)`;

        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.roundRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 1, this.gridSize - 1, 5);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    draw() {
        // Hintergrund
        this.ctx.fillStyle = "#111";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // State: Menü
        if (this.state === "menu") {
            this.ctx.fillStyle = "white";
            this.ctx.font = "28px monospace";
            this.ctx.textAlign = "center";
            this.ctx.fillText("SNAKE ARCADE", this.canvas.width / 2, 100);
            this.ctx.font = "18px monospace";
            this.ctx.fillText(`Skin: ${this.availableSkins[this.skinIndex]} (K drucken)`, this.canvas.width / 2, 160);
            this.ctx.fillText(`Früchte: ${this.availableFruitSets[this.fruitIndex]} (F drücken)`, this.canvas.width / 2, 200);
            this.ctx.fillText(`Endlosmodus: ${this.infinityMode ? "AN" : "AUS"} (M drücken)`, this.canvas.width / 2, 240);
            this.ctx.fillText("Enter zum Starten", this.canvas.width / 2, 300);
            this.ctx.fillText("P = Pause", this.canvas.width / 2, 340);
            return;
        }

        // Obstacles
        this.ctx.fillStyle = "#555";
        this.obstacles.forEach(o => {
            this.ctx.fillRect(o.x * this.gridSize, o.y * this.gridSize, this.gridSize, this.gridSize);
        });

        // Snake
        this.snake.forEach((segment, i) => this.drawSnakeSegment(segment, i));

        // Food
        const pulse = Math.sin(Date.now() / 200) * 2 + this.gridSize / 2;
        this.ctx.fillStyle = this.food.type.color;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            pulse / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // HUD
        this.ctx.fillStyle = "white";
        this.ctx.font = "18px monospace";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Score: ${this.score}`, 10, 20);
        this.ctx.fillText(`High: ${this.highScore}`, 10, 40);
        this.ctx.fillText(`Level: ${this.level}`, 10, 60);
        this.ctx.textAlign = "right";
        this.ctx.fillText("P = Pause", this.canvas.width - 10, 20);

        if (this.paused) {
            this.ctx.fillStyle = "rgba(0,0,0,0.5)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "yellow";
            this.ctx.font = "40px monospace";
            this.ctx.textAlign = "center";
            this.ctx.fillText("PAUSED", this.canvas.width / 2, this.canvas.height / 2);
        }

        if (this.gameOver) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "white";
            this.ctx.font = "48px monospace";
            this.ctx.textAlign = "center";
            this.ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = "24px monospace";
            this.ctx.fillText("Press Enter to Menu", this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }

    start() {
        // Extra: Menü-Steuerung
        document.addEventListener("keydown", (e) => {
            if (this.state === "menu") {
                if (e.key.toLowerCase() === "k") this.changeSkin();
                if (e.key.toLowerCase() === "f") this.changeFruitSet();
                if (e.key.toLowerCase() === "m") this.toggleInfinityMode();
            }
        });

        const loop = (timestamp) => {
            const dt = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;
            this.update(dt);
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        this.lastTime = performance.now();
        requestAnimationFrame(loop);
    }

    stop() {
        cancelAnimationFrame(this.animationId);
    }
}
