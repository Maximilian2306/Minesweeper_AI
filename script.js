const boardSize = 10;         // 10x10 Grid
const mineCount = 10;         // Anzahl der Minen
const board = [];             // Spielfeld als 2D-Array
let gameOver = false;

let startTime = null;
let timerInterval = null;
const timerDisplay = document.getElementById('timer'); // Muss im HTML existieren!


const boardElement = document.getElementById('game-board');
const mineCounter = document.getElementById('mine-count');
const restartBtn = document.getElementById('restart-btn');
const msgBoxLose = document.getElementById('game-over');

restartBtn.addEventListener('click', init);

function init() {
  // const msgBox = document.getElementById('game-over');
  boardElement.innerHTML = '';
  gameOver = false;
  board.length = 0;
  mineCounter.textContent = `Minen: ${mineCount}`;
  generateBoard();
  placeMines();
  calculateNumbers();
  renderBoard();
  msgBoxLose.style.display = 'none'; // Verstecke die Nachricht

  startTime = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

}

function generateBoard() {
  for (let y = 0; y < boardSize; y++) {
    board[y] = [];
    for (let x = 0; x < boardSize; x++) {
      board[y][x] = {
        x,
        y,
        mine: false,
        revealed: false,
        flagged: false,
        number: 0
      };
    }
  }
}

function placeMines() {
  let placed = 0;
  while (placed < mineCount) {
    const x = Math.floor(Math.random() * boardSize);
    const y = Math.floor(Math.random() * boardSize);
    const cell = board[y][x];
    if (!cell.mine) {
      cell.mine = true;
      placed++;
    }
  }
}

function calculateNumbers() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (cell.mine) continue;
      cell.number = countNeighborMines(x, y);
    }
  }
}

function countNeighborMines(x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        if (board[ny][nx].mine) count++;
      }
    }
  }
  return count;
}

function renderBoard() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      const div = document.createElement('div');
      div.classList.add('cell');
      div.dataset.x = x;
      div.dataset.y = y;

      div.addEventListener('click', () => handleLeftClick(x, y));
      div.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        handleRightClick(x, y);
      });

      boardElement.appendChild(div);
    }
  }
}

function handleLeftClick(x, y) {
  if (gameOver) return;
  const cell = board[y][x];
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  updateCell(x, y);

  if (cell.mine) {
    revealAllMines();
    // alert("💥 Boom! Du bist auf eine Mine getreten!");
    showGameOverMessage();
    gameOver = true;

    clearInterval(timerInterval);
  }
}

function handleRightClick(x, y) {
  if (gameOver) return;
  const cell = board[y][x];
  if (cell.revealed) return;

  cell.flagged = !cell.flagged;
  updateCell(x, y);
}

function updateCell(x, y) {
  const cell = board[y][x];
  const cellDiv = getCellDiv(x, y);

  cellDiv.classList.toggle('revealed', cell.revealed);
  cellDiv.classList.toggle('mine', cell.revealed && cell.mine);
  cellDiv.classList.toggle('flagged', cell.flagged && !cell.revealed);
  cellDiv.textContent = '';

  if (cell.revealed && cell.mine) {
    cellDiv.textContent = '💣';
  }
  if (cell.revealed && cell.number > 0 && !cell.mine) {
    cellDiv.textContent = cell.number;
  }
  if (cell.flagged && !cell.revealed) {
    cellDiv.textContent = '🚩';
  }
}

function revealAllMines() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (cell.mine) {
        cell.revealed = true;
        updateCell(x, y);
      }
    }
  }
}

function getCellDiv(x, y) {
  const index = y * boardSize + x;
  return boardElement.children[index];
}

function showGameOverMessage() {
  // const msgBox = document.getElementById('game-over');
  //msgBoxLose.classList.add('message-box');
  msgBoxLose.style.display = 'block';
}

function updateTimer() {
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - startTime) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
  const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

// Start direkt beim Laden
init();