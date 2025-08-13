import { PongGame } from './pong.js';
import { SnakeGame } from './snake.js';
import { InvadersGame } from './invaders.js';

export class ArcadeManager {
    constructor() {
        this.arcadeView = document.getElementById('arcade-view');
        this.arcadeMenu = document.getElementById('arcade-menu');
        this.canvas = document.getElementById('pong-canvas');
        this.exitButton = document.getElementById('exit-arcade');
        this.currentGame = null;

        this.bindEvents();
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 500;
    }

    bindEvents() {
        document.querySelectorAll('.game-select').forEach(button => {
            button.addEventListener('click', () => this.startGame(button.dataset.game));
        });

        this.exitButton.addEventListener('click', () => this.exit());
    }

    show() {
        document.body.style.overflow = 'hidden';
        document.querySelector('.game-container').style.display = 'none';
        this.arcadeView.style.display = 'flex';
        this.arcadeMenu.style.display = 'flex';
        this.canvas.style.display = 'none';
    }

    startGame(gameName) {
        this.arcadeMenu.style.display = 'none';
        this.canvas.style.display = 'block';

        switch(gameName) {
            case 'pong':
                this.currentGame = new PongGame(this.canvas);
                break;
            case 'snake':
                this.currentGame = new SnakeGame(this.canvas);
                break;
            case 'invaders':
                this.currentGame = new InvadersGame(this.canvas);
                break;
        }

        if (this.currentGame) {
            this.currentGame.start();
        }
    }

    exit() {
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }
        this.arcadeView.style.display = 'none';
        document.querySelector('.game-container').style.display = 'grid';
        document.body.style.overflow = 'auto';
        this.canvas.style.display = 'none';
        this.arcadeMenu.style.display = 'flex';
    }
}