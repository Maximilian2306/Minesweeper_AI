
// src/js/arcade/pong.js
export class PongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.ballSize = 10;
        this.speed = 5;
        
        this.reset();
        this.bindControls();
    }

    reset() {
        this.leftY = this.canvas.height / 2 - this.paddleHeight / 2;
        this.rightY = this.canvas.height / 2 - this.paddleHeight / 2;
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        this.ballSpeedX = this.speed;
        this.ballSpeedY = this.speed;
        this.score = { left: 0, right: 0 };
    }

    bindControls() {
        this.keys = {};
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    update() {
        // Paddle movement
        if (this.keys['w'] && this.leftY > 0) this.leftY -= this.speed;
        if (this.keys['s'] && this.leftY < this.canvas.height - this.paddleHeight) this.leftY += this.speed;
        if (this.keys['ArrowUp'] && this.rightY > 0) this.rightY -= this.speed;
        if (this.keys['ArrowDown'] && this.rightY < this.canvas.height - this.paddleHeight) this.rightY += this.speed;

        // Ball movement
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;

        // Wall collisions
        if (this.ballY <= 0 || this.ballY >= this.canvas.height) {
            this.ballSpeedY *= -1;
        }

        // Paddle collisions
        if (this.ballX <= this.paddleWidth && 
            this.ballY > this.leftY && 
            this.ballY < this.leftY + this.paddleHeight) {
            this.ballSpeedX *= -1.1; // Increase speed slightly
            this.ballX = this.paddleWidth;
        }

        if (this.ballX >= this.canvas.width - this.paddleWidth && 
            this.ballY > this.rightY && 
            this.ballY < this.rightY + this.paddleHeight) {
            this.ballSpeedX *= -1.1; // Increase speed slightly
            this.ballX = this.canvas.width - this.paddleWidth;
        }

        // Score
        if (this.ballX < 0) {
            this.score.right++;
            this.reset();
        }
        if (this.ballX > this.canvas.width) {
            this.score.left++;
            this.reset();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();

        // Draw paddles
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, this.leftY, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(
            this.canvas.width - this.paddleWidth, 
            this.rightY, 
            this.paddleWidth, 
            this.paddleHeight
        );

        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.ballSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw score
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `${this.score.left} - ${this.score.right}`, 
            this.canvas.width / 2, 
            50
        );
    }

    start() {
        const gameLoop = () => {
            this.update();
            this.draw();
            this.animationId = requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}