import { updateTimer } from '../utils/timer.js';

export class MinesweeperGame {
  constructor(size, mines) {
    this.boardSize = size;
    this.mineCount = mines;
    this.board = [];
    this.gameOver = false;
    this.startTime = null;
    this.timerInterval = null;
    this.kiRunning = false;
    this.kiTimeout = null;
  }

  init() {
    this.board = [];
    this.gameOver = false;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.startTime = null;

    this.generateBoard();
    this.placeMines();
    this.calculateNumbers();
  }

  generateBoard() {
    for (let y = 0; y < this.boardSize; y++) {
      this.board[y] = [];
      for (let x = 0; x < this.boardSize; x++) {
        this.board[y][x] = {
          x,
          y,
          mine: false,
          revealed: false,
          flagged: false,
          number: 0,
        };
      }
    }
  }

  placeMines() {
    let placed = 0;
    while (placed < this.mineCount) {
      const x = Math.floor(Math.random() * this.boardSize);
      const y = Math.floor(Math.random() * this.boardSize);
      const cell = this.board[y][x];
      if (!cell.mine) {
        cell.mine = true;
        placed++;
      }
    }
  }

  calculateNumbers() {
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        const cell = this.board[y][x];
        if (cell.mine) continue;
        cell.number = this.countNeighborMines(x, y);
      }
    }
  }

  countNeighborMines(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
          if (this.board[ny][nx].mine) count++;
        }
      }
    }
    return count;
  }

  revealCell(x, y) {
    if (this.gameOver) return { changed: [], result: 'ignore' };

    const cell = this.board[y][x];
    if (cell.revealed || cell.flagged) return { changed: [], result: 'ignore' };

    const changed = [];

    const floodReveal = (cx, cy) => {
      const stack = [[cx, cy]];
      const seen = new Set();

      while (stack.length > 0) {
        const [sx, sy] = stack.pop();
        const key = `${sx},${sy}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const c = this.board[sy][sx];
        if (c.revealed) continue;
        c.revealed = true;
        changed.push({ x: sx, y: sy });

        // If no number, check neighbors
        if (c.number === 0 && !c.mine) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = sx + dx;
              const ny = sy + dy;
              if (
                nx >= 0 && nx < this.boardSize &&
                ny >= 0 && ny < this.boardSize
              ) {
                stack.push([nx, ny]);
              }
            }
          }
        }
      }
    };

    if (cell.mine) {
      if (this.kiRunning) {
        this.gameOver = true;
        return { changed, result: 'ki' };
      }
      this.gameOver = true;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      return { changed: [{ x, y }], result: 'lose' };
    }

    floodReveal(x, y);

    if (this.checkWin()) {
      if (this.kiRunning) {
        this.kiRunning = false;
      }
      this.gameOver = true;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      return { changed, result: 'win' };
    }

    return { changed, result: 'ok' };
  }

  toggleFlag(x, y) {
    if (this.gameOver) return;
    const cell = this.board[y][x];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    return { x, y };
  }

  checkWin() {
    return this.board.every(row =>
      row.every(cell => cell.mine || cell.revealed)
    );
  }

  getCell(x, y) {
    return this.board[y][x];
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => updateTimer(this), 1000);
  }

  resetGameState() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.startTime = null;

    this.kiRunning = false;
    if (this.kiTimeout) {
      clearTimeout(this.kiTimeout);
      this.kiTimeout = null;
    }
    this.gameOver = true;
  }
}
