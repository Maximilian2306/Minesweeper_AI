let boardSize = 10;      // Größe des Spielfelds (10x10 Grid)
let mineCount = 10;      // Anzahl der Minen
const board = [];        // Spielfeld als 2D-Array
let gameOver = false;

let startTime = null;    // Startzeit für den Timer
let timerInterval = null;   // Timer Intervall

let kiRunning = false;  // Flag, ob die KI aktiv ist
let kiTimeout = null;   // Timeout für die KI, um sie zu stoppen

/**
 * Referenzen auf die HTML-Elemente, die für das Spiel benötigt werden.
 */
// Timer Element //
const timerDisplay = document.getElementById('timer'); // Muss im HTML existieren!
// Minen Counter Element //
const mineCounter = document.getElementById('mine-count'); // Muss im HTML existieren!
// Gameboard Element //
const boardElement = document.getElementById('game-board'); // Muss im HTML existieren!
// Header Container Element //
const headerContainer = document.getElementById('header-container'); 
// Leaderboard Elemente //
const leaderboardKey = 'minesweeper-leaderboard'; // Schlüssel für die Bestenliste im Local Storage
const leaderboardList = document.getElementById('leaderboard-list'); // Bestenliste
const leaderboardListPopup = document.getElementById('leaderboard-list-popup'); // Bestenliste im Pop-up
/**
 * Referenzen auf die Buttons, die im Spiel verwendet werden.
 */
// Start Button //
const startBtn = document.getElementById('start-btn'); // Start Button
const modePopup = document.getElementById('mode-popup'); // Modus-Auswahl Popup
const modeButtons = document.querySelectorAll('.mode-btn'); // Modus-Auswahl Buttons (Anfänger, Mittelmäßig, Fortgeschritten, Profi)
// KI Buttons //
const kiButton = document.getElementById('kiActBtn'); // KI Button
const ruleBasedKIBtn = document.getElementById("startRuleKI"); // Regelbasierte KI Button
const randomKIBtn = document.getElementById("startRandomKI"); // Zufalls-KI Button
const kiMenu = document.getElementById("kiMenu"); // KI Menü-Dialog
const stopBtn = document.getElementById("stopKI"); // Stop-KI Button
// Restart Button //
const restartBtn = document.getElementById('restart-btn'); // Restart Button
// Message Box Buttons //
const msgBoxLoseBtn = document.getElementById('game-over-btn'); // Game Over Button
const msgBoxLoseLBBtn = document.getElementById('game-over-leaderboard-btn'); // Game Over Button für die Bestenliste
const msgBoxWinBtn = document.getElementById('game-win-btn'); // Game Win Button
const msgBoxWinLBBtn = document.getElementById('game-win-leaderboard-btn'); // Game Win Button für die Bestenliste
// Bestenliste Buttons //
const openLeaderboardBtn = document.getElementById('open-leaderboard-btn'); // Öffnen Button für die Bestenliste
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn'); // Schließen Button für die Bestenliste
const clearLeaderboardBtn = document.getElementById('clear-leaderboard-btn'); // Bestenliste leeren Button


// Pop-up Nachrichtenboxen //
const msgBoxLose = document.getElementById('game-over'); // Pop-up für Game Over
const msgBoxWin = document.getElementById('game-win'); // Pop-up für Game Win
const leaderboardPopup = document.getElementById('leaderboard-popup'); // Pop-up für die Bestenliste


/**
 * Initialisiert die Event-Listener welche beim clicken auf die verschiedenen Buttons bestimmte Funktionen/Aktionen ausführen.
 * Diese Funktion wird auch direkt beim Laden der Seite aufgerufen, um das Spiel zu initialisieren
 */
// "Spiel starten" öffnet Popup zur Moduswahl
startBtn.addEventListener('click', () => {
  modePopup.style.display = 'flex';
  document.body.classList.add('popup-open');
});

// Modusauswahl-Buttons
modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    boardSize = parseInt(button.getAttribute('data-size'));
    mineCount = parseInt(button.getAttribute('data-mines'));

    // CSS-Grid dynamisch anpassen
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`;
    boardElement.style.gridTemplateRows = `repeat(${boardSize}, 30px)`;

    modePopup.style.display = 'none';
    document.body.classList.remove('popup-open');
    kiRunning = false; // Stoppe die KI, wenn ein neuer Spiel-Modus gewählt wird
    stopBtn.style.display = 'none'; // Verstecke den Stop-KI Button
    kiMenu.style.display = "none"; // Verstecke das KI-Menü
    headerContainer.style.maxWidth = "360px"; // Header zurücksetzen
    init(); // Spiel starten mit neuem Modus
  });
});


// "KI aktivieren" Button
kiButton.addEventListener("click", (e) => {
  if (kiMenu.style.display === "none") {
    // Menü direkt neben dem Button positionieren
    const rect = kiButton.getBoundingClientRect();
    kiMenu.style.left = rect.left + "px";
    kiMenu.style.top = (rect.bottom + window.scrollY) + "px";
    kiMenu.style.display = "block";
  } else {
    kiMenu.style.display = "none";
  }
});

// "Stop KI" Button
stopBtn.addEventListener("click", () => {
  kiRunning = false;
  stopBtn.style.display = "none"; // Verstecke den Stop-KI Button
  headerContainer.style.maxWidth = "360px"; // Header zurücksetzen
  kiMenu.style.display = "none" ; // Verstecke das KI-Menü
  clearTimeout(kiTimeout);
});

// // Zufalls-KI Button
// randomKIBtn.addEventListener("click", async () => {
//   kiMenu.style.display = "none";
//   stopBtn.style.display = "inline-block";
//   headerContainer.style.maxWidth = "460px"; // Erweitere den Header für die KI

//   if (kiRunning) return; // Verhindere mehrfaches Starten der KI
//   kiRunning = true; 

//   while (kiRunning) {
//     await sleep(100); // kleine Pause für realistischere "Denkzeit"

//     if (gameOver) {
//       init(); // Spiel bei Verlust automatisch neustarten
//       await sleep(200); // Pause nach Neustart
//       continue;
//     }

//     const unrevealedCells = [];
//     for (let y = 0; y < boardSize; y++) {
//       for (let x = 0; x < boardSize; x++) {
//         const cell = board[y][x];
//         if (!cell.revealed && !cell.flagged) {
//           unrevealedCells.push({ x, y });
//         }
//       }
//     }

//     if (unrevealedCells.length === 0) { 
//       kiRunning = false;
//       stopBtn.style.display = "none"; // Verstecke den Stop-KI Button
//       headerContainer.style.maxWidth = "360px"; // Header zurücksetzen
//       break;
//     }

//     const randomCell = unrevealedCells[Math.floor(Math.random() * unrevealedCells.length)];
//     handleLeftClick(randomCell.x, randomCell.y);
//   }
// });

randomKIBtn.addEventListener("click", async () => {
  kiMenu.style.display = "none";
  stopBtn.style.display = "inline-block";
  headerContainer.style.maxWidth = "460px";

  if (kiRunning) return;
  kiRunning = true;

  // Einmal alle möglichen Zellen sammeln
  let unrevealedCells = [];
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.revealed && !cell.flagged) {
        unrevealedCells.push({ x, y });
      }
    }
  }

  // Mische die Zellen (Fisher-Yates Shuffle)
  for (let i = unrevealedCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unrevealedCells[i], unrevealedCells[j]] = [unrevealedCells[j], unrevealedCells[i]];
  }

  let i = 0;

  while (kiRunning && i < unrevealedCells.length) {
    await sleep(50); // Kürzere Denkzeit möglich

    if (gameOver) {
      init();
      await sleep(200);

      // Neue Liste erstellen nach Neustart
      unrevealedCells = [];
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          const cell = board[y][x];
          if (!cell.revealed && !cell.flagged) {
            unrevealedCells.push({ x, y });
          }
        }
      }

      // Liste neu mischen
      for (let i = unrevealedCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unrevealedCells[i], unrevealedCells[j]] = [unrevealedCells[j], unrevealedCells[i]];
      }

      i = 0;
      continue;
    }

    const cell = unrevealedCells[i++];
    handleLeftClick(cell.x, cell.y);
  }

  // kiRunning = false;
  // stopBtn.style.display = "none";
  // headerContainer.style.maxWidth = "360px";
});

// Hilfsfunktion für Verzögerung (Warte Funktion)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Regelbasierte KI Button
// ruleBasedKIBtn.addEventListener("click", async () => {
//   if (gameOver) return;
//   if (kiRunning) return; // Verhindere mehrfaches Starten der KI
//   kiMenu.style.display = "none";
//   stopBtn.style.display = "inline-block";
//   headerContainer.style.maxWidth = "460px"; // Erweitere den Header für die KI
//   kiRunning = true;
//   runRuleBasedAI();
// });

// Regelbasierte KI Button
ruleBasedKIBtn.addEventListener("click", async () => {
  if (gameOver || kiRunning) return;

  kiMenu.style.display = "none";
  stopBtn.style.display = "inline-block";
  headerContainer.style.maxWidth = "460px";
  kiRunning = true;

  while (kiRunning) {
    await sleep(100);

    if (gameOver) {
      init();
      await sleep(200);
      continue;
    }

    let changed = false;

    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const cell = board[y][x];
        if (!cell.revealed || cell.number === 0) continue;

        const neighbors = getNeighbors(x, y);
        const flagged = neighbors.filter(n => n.flagged).length;
        const hidden = neighbors.filter(n => !n.revealed && !n.flagged);

        if (flagged === cell.number) {
          for (const n of hidden) {
            if (!n.revealed) {
              handleLeftClick(n.x, n.y);
              changed = true;
              await sleep(50);
            }
          }
        }

        if (hidden.length > 0 && hidden.length === (cell.number - flagged)) {
          for (const n of hidden) {
            if (!n.flagged) {
              handleRightClick(n.x, n.y);
              changed = true;
              await sleep(50);
            }
          }
        }
      }
    }

    if (!changed) {
      const guess = pickRandomUnrevealed();
      if (guess) {
        handleLeftClick(guess.x, guess.y);
      } else {
        kiRunning = false;
        stopBtn.style.display = "none";
        headerContainer.style.maxWidth = "360px";
        break;
      }
    }
  }
});

// Hilfsfunktion: Nachbarn eines Feldes finden
function getNeighbors(x, y) {
  const neighbors = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        const neighbor = board[ny][nx];
        neighbors.push({ ...neighbor, x: nx, y: ny }); // Wichtig: Koordinaten mitschicken!
      }
    }
  }

  return neighbors;
}

// Hilfsfunktion: zufälliges Feld wählen
function pickRandomUnrevealed() {
  const list = [];
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.revealed && !cell.flagged) {
        list.push({ x, y });
      }
    }
  }
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}




// Restart-Button //
restartBtn.addEventListener('click', () => {
  init();
  kiRunning = false; // Stoppe die KI, wenn das Spiel neu gestartet wird
  stopBtn.style.display = 'none'; // Verstecke den Stop-KI Button
  kiMenu.style.display = "none"; // Verstecke das KI-Menü
  headerContainer.style.maxWidth = "360px"; // Header zurücksetzen
});
msgBoxLoseBtn.addEventListener('click', init);
msgBoxWinBtn.addEventListener('click', init);

// Öffne das Leaderboard-Popup (für Game Over)
msgBoxLoseLBBtn.addEventListener('click', () => {
  renderLeaderboard();
  leaderboardPopup.style.display = 'flex';
  document.body.classList.add('popup-open');
});

// Öffne das Leaderboard-Popup (für Game Win)
msgBoxWinLBBtn.addEventListener('click', () => {
  renderLeaderboard();
  leaderboardPopup.style.display = 'flex';
  document.body.classList.add('popup-open');
});

// Öffne das Leaderboard-Popup (über den Header-Button)
openLeaderboardBtn.addEventListener('click', () => {
  renderLeaderboard();
  kiRunning = false; // Stoppe die KI, wenn das Leaderboard geöffnet wird
  stopBtn.style.display = 'none'; // Verstecke den Stop-KI Button
  kiMenu.style.display = "none"; // Verstecke das KI-Menü
  headerContainer.style.maxWidth = "360px"; // Header zurücksetzen
  leaderboardPopup.style.display = 'flex';
  document.body.classList.add('popup-open');
});

// Schließen des Leaderboard-Popups
closeLeaderboardBtn.addEventListener('click', () => {
  leaderboardPopup.style.display = 'none';
  document.body.classList.remove('popup-open');
});

// Leeren des Leaderboards Cache
clearLeaderboardBtn.addEventListener('click', () => {
  if (localStorage.getItem(leaderboardKey) === null) {
    alert("Die Bestenliste ist bereits leer.");
    return;
  } else {
    if (confirm("Bist du sicher, dass du die Bestenliste löschen willst?")) {
      localStorage.removeItem(leaderboardKey);
      renderLeaderboard();
    }
  }
});


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
    // showGameOverMessage();
    if (!kiRunning) showGameOverMessage(); // Nur anzeigen, wenn kein KI-Modus läuft

    gameOver = true;
    clearInterval(timerInterval);
  }

  if (checkWin()) {

    if (kiRunning) { // Wenn KI läuft, stoppe sie
      stopBtn.style.display = "none"; // Verstecke den Stop-KI Button
      kiMenu.style.display = "none"; // Verstecke das KI-Menü
      headerContainer.style.maxWidth = "360px"; // Header zurücksetzen
      kiRunning = false; // Setze KI-Status zurück
    }

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

    // Normales Board
  leaderboardList.innerHTML = '';
  // Popup-Board
  leaderboardListPopup.innerHTML = '';

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<li>Keine Einträge</li>';
    leaderboardListPopup.innerHTML = '<li>Keine Einträge</li>';
    return;
  }

  leaderboard.forEach(entry => {
    const listItem1 = document.createElement('li');
    const listItem2 = document.createElement('li');

    const timeStamp = formatTime(entry.time);

    listItem1.innerHTML = `<span>${entry.name}</span><span>${timeStamp}</span>`;
    listItem2.innerHTML = `<span>${entry.name}</span><span>${timeStamp}</span>`;
    
    leaderboardList.appendChild(listItem1);
    leaderboardListPopup.appendChild(listItem2);
  });
}

// Sekunden in mm:ss umwandeln
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}





// Spaß-Funktion: Arcade-Spiel (Pong)
const arcadeBtn = document.getElementById("arcade-btn");
const arcadeView = document.getElementById("arcade-view");
const exitArcade = document.getElementById("exit-arcade");
const canvas = document.getElementById("pong-canvas");
const ctx = canvas.getContext("2d");

arcadeBtn.addEventListener("click", () => {
  document.body.style.overflow = "hidden";
  document.querySelector(".game-container").style.display = "none";
  arcadeView.style.display = "block";
  requestAnimationFrame(gameLoop);
});

exitArcade.addEventListener("click", () => {
  arcadeView.style.display = "none";
  document.querySelector(".game-container").style.display = "grid";
  document.body.style.overflow = "auto";
  cancelAnimationFrame(animationId);
});

// --- Simple Pong Game ---
let paddleHeight = 100, paddleWidth = 10;
let leftY = 200, rightY = 200;
let ballX = 400, ballY = 250, ballSpeedX = 4, ballSpeedY = 4;
let animationId = null;

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function gameLoop() {
  // Movement
  if (keys["w"]) leftY -= 5;
  if (keys["s"]) leftY += 5;
  if (keys["ArrowUp"]) rightY -= 5;
  if (keys["ArrowDown"]) rightY += 5;

  // Ball movement
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Wall bounce
  if (ballY <= 0 || ballY >= canvas.height) ballSpeedY *= -1;

  // Paddle bounce
  if (
    ballX <= paddleWidth &&
    ballY > leftY && ballY < leftY + paddleHeight
  ) ballSpeedX *= -1;

  if (
    ballX >= canvas.width - paddleWidth &&
    ballY > rightY && ballY < rightY + paddleHeight
  ) ballSpeedX *= -1;

  // Reset ball if out
  if (ballX < 0 || ballX > canvas.width) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
  }

  // Draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Paddles
  ctx.fillStyle = "white";
  ctx.fillRect(0, leftY, paddleWidth, paddleHeight);
  ctx.fillRect(canvas.width - paddleWidth, rightY, paddleWidth, paddleHeight);

  // Ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
  ctx.fill();

  animationId = requestAnimationFrame(gameLoop);
}
// --- Ende des Arcade-Spiels ---







// Start direkt beim Laden
init();