const boardSize = 2;         // 10x10 Grid
const mineCount = 1;         // Anzahl der Minen
const board = [];             // Spielfeld als 2D-Array
let gameOver = false;

let startTime = null;
let timerInterval = null;
const timerDisplay = document.getElementById('timer'); // Muss im HTML existieren!


/**
 * Referenzen auf die HTML-Elemente, die für das Spiel benötigt werden.
 */
const boardElement = document.getElementById('game-board');
const mineCounter = document.getElementById('mine-count');
const restartBtn = document.getElementById('restart-btn');
const msgBoxLose = document.getElementById('game-over');
const msgBoxLoseBtn = document.getElementById('game-over-btn');
const msgBoxLoseLBBtn = document.getElementById('game-over-leaderboard-btn');
const msgBoxWin = document.getElementById('game-win');
const msgBoxWinBtn = document.getElementById('game-win-btn');
const msgBoxWinLBBtn = document.getElementById('game-win-leaderboard-btn');

const leaderboardPopup = document.getElementById('leaderboard-popup');
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
const clearLeaderboardBtn = document.getElementById('clear-leaderboard-btn');
const highscoresBtn = document.getElementById('highscores-btn'); 

const leaderboardKey = 'minesweeper-leaderboard';
const leaderboardList = document.getElementById('leaderboard-list');

/**
 * Initialisiert die Event-Listener welche beim clicken auf den Restart-Button oder den "Game Over"-Button das Spiel neu starten.
 * Diese Funktion wird auch direkt beim Laden der Seite aufgerufen, um das Spiel zu initialisieren
 */
restartBtn.addEventListener('click', init);
msgBoxLoseBtn.addEventListener('click', init);
msgBoxWinBtn.addEventListener('click', init);


/**
 * Initialisiert das Spiel, generiert das Spielfeld, platziert die Minen und berechnet die Zahlen.
 */
function init() {
  boardElement.innerHTML = '';
  gameOver = false;
  board.length = 0;
  mineCounter.textContent = `Minen: ${mineCount}`;
  generateBoard();
  placeMines();
  calculateNumbers();
  renderBoard();
  msgBoxLose.style.display = 'none'; // Verstecke die Nachricht
  msgBoxWin.style.display = 'none'; // Verstecke die Nachricht

  startTime = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  renderLeaderboard(); // Bestenliste anzeigen

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
    showGameOverMessage();

    gameOver = true;
    clearInterval(timerInterval);
  }

  if (checkWin()) {
    revealAllMines();
    showWinMessage(); 

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

function checkWin() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.mine && !cell.revealed) {
        return false; // Es gibt noch eine nicht-Mine-Zelle, die nicht aufgedeckt ist
      }
    }
  }
  return true; // Alle sicheren Zellen sind aufgedeckt
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

function showWinMessage() {
  msgBoxWin.style.display = 'block';

  const now = Date.now();
  const elapsedSeconds = Math.floor((now - startTime) / 1000);
  saveWinToLeaderboard(elapsedSeconds);
}

function updateTimer() {
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - startTime) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
  const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}



// Öffne das Leaderboard-Popup
msgBoxLoseLBBtn.addEventListener('click', () => {
  renderLeaderboard();
  leaderboardPopup.style.display = 'block';
});

// Öffne das Leaderboard-Popup
msgBoxWinLBBtn.addEventListener('click', () => {
  renderLeaderboard();
  leaderboardPopup.style.display = 'block';
});

// Öffne das Leaderboard-Popup
highscoresBtn.addEventListener('click', () => {
  // showLeaderboard();
  renderLeaderboard();
  leaderboardPopup.style.display = 'block';
  // leaderboardModal.classList.remove('hidden');
});

// Schließen
closeLeaderboardBtn.addEventListener('click', () => {
  // leaderboardModal.classList.add('hidden');
  leaderboardPopup.style.display = 'none';
});

// Leeren
clearLeaderboardBtn.addEventListener('click', () => {
  localStorage.removeItem('leaderboard');
  renderLeaderboard();
});




// Siegerergebnis speichern
function saveWinToLeaderboard(timeInSeconds) {
  const playerName = prompt("🎉 Du hast gewonnen! Bitte gib deinen Namen ein:", "Spieler");
  if (!playerName) return;

  const newEntry = {
    name: playerName,
    time: timeInSeconds
  };

  let leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
  leaderboard.push(newEntry);

  // Sortiere nach Zeit aufsteigend
  leaderboard.sort((a, b) => a.time - b.time);

  // Begrenze auf Top 10
  leaderboard = leaderboard.slice(0, 10);

  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
  renderLeaderboard();
}

// Bestenliste anzeigen
function renderLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
  leaderboardList.innerHTML = '';

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<li>Keine Einträge</li>';
    return;
  }

  leaderboard.forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${entry.name}</span><span>${formatTime(entry.time)}</span>`;
    leaderboardList.appendChild(li);
  });
}

// Sekunden in mm:ss umwandeln
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}












// Start direkt beim Laden
init();