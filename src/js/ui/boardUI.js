import { openPopup } from '/src/js/utils/handlePopups.js';

export class BoardUI {
  constructor(game, element, leaderboard) {
    this.game = game;
    this.element = element;
    this.leaderboard = leaderboard;
  }

  renderBoard() {
    this.element.innerHTML = '';

    this.element.style.gridTemplateColumns = `repeat(${this.game.boardSize}, 30px)`;
    this.element.style.gridTemplateRows = `repeat(${this.game.boardSize}, 30px)`;

    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        const div = document.createElement('div');
        div.classList.add('cell');
        div.dataset.x = x;
        div.dataset.y = y;

        div.addEventListener('click', () => this.onLeftClick(x, y));
        div.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.onRightClick(x, y);
        });

        this.element.appendChild(div);
      }
    }
  }

  onLeftClick(x, y) {
    if (!this.game.startTime) {
      this.game.startTimer();
    }

    const result = this.game.revealCell(x, y);
    // this.updateBoard();
    
    // this.updateCell(x, y);
    result.changed.forEach(({x, y}) => this.updateCell(x, y));

    if (result.result === 'ki') {
      this.revealAllMinesUI();
      this.updateBoard();
    }
    
    if (result.result === 'lose') {
      const restartBtn = document.getElementById('restart-btn');
      restartBtn.textContent = '😵 Neues Spiel';
      this.revealAllMinesUI();
      openPopup('game-over');
    }

    if (result.result === 'win') {
      this.revealAllMinesUI();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - this.game.startTime) / 1000);
      openPopup('game-win');

      try {
        this.leaderboard.saveWinToLeaderboard(elapsedSeconds);
      } catch (err) {
        console.error("Failed to save in leaderboard:", err);
      }
    }
  }

  onRightClick(x, y) {
    if (!this.game.startTime) {
      this.game.startTimer();
    }

    this.game.toggleFlag(x, y);
    // this.updateBoard();
    this.updateCell(x, y);
  }

  updateBoard() {
    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        this.updateCell(x, y);
      }
    }
  }

  updateCell(x, y) {
    const cell = this.game.getCell(x, y);
    const index = y * this.game.boardSize + x;
    const div = this.element.children[index];

    div.classList.toggle('revealed', cell.revealed);
    div.classList.toggle('mine', cell.revealed && cell.mine);
    div.classList.toggle('flagged', cell.flagged && !cell.revealed);

    if (cell.revealed && cell.number > 0 && !cell.mine) {
      div.dataset.number = cell.number;
    } else {
      delete div.dataset.number;
    }

    div.textContent = '';

    // if (cell.revealed && cell.mine) {
    //   div.textContent = '💣';
    // } else 
    if (cell.revealed && cell.number > 0 && !cell.mine) {
      div.textContent = cell.number;
    } 
    // else if (cell.flagged && !cell.revealed) {
    //   div.textContent = '🚩';
    // }
  }

  revealAllMinesUI() {
    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        const cell = this.game.getCell(x, y);
        if (cell.mine) {
          cell.revealed = true;
          this.updateCell(x, y);
        }
      }
    }
  }
}

