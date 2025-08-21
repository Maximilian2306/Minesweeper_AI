import { sleep } from '../utils/helpers.js';
import { aiSpeed, incrementGameCount } from './AIMenu.js';

// KI Buttons //
const stopBtn = document.getElementById('stopKI'); 
const headerContainer = document.getElementById('header-container');
const kiMenu = document.getElementById('kiMenu');


export class RandomAI {
  constructor(game, boardUI) {
    this.game = game;
    this.boardUI = boardUI;
  }
  
  // Start random AI
  async run() {
    if (this.game.gameOver || this.game.kiRunning) return;
    this.game.kiRunning = true;
     
    console.log("Aktueller Speed: " + aiSpeed);

    kiMenu.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    headerContainer.style.maxWidth = '460px';

    // Collect all unrevealed cells
    let unrevealedCells = [];
    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        const cell = this.game.board[y][x];
        if (!cell.revealed && !cell.flagged) {
          unrevealedCells.push({ x, y });
        }
      }
    }

    // Fisher-Yates shuffle to randomize the order of unrevealed cells
    for (let i = unrevealedCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unrevealedCells[i], unrevealedCells[j]] = [
        unrevealedCells[j],
        unrevealedCells[i],
      ];
    }

    let i = 0;

    while (this.game.kiRunning && i < unrevealedCells.length) {
      if (aiSpeed > 0) {
        await sleep(aiSpeed); 
        console.log("Gemessen mit Await: " + aiSpeed);
      } else {
        console.log("Gemessen ohne Await: " + aiSpeed);
      }

      if (this.game.gameOver) {
        incrementGameCount();
        this.game.init();
        await sleep(0);

        // Create a new list after game reset
        unrevealedCells = [];
        for (let y = 0; y < this.game.boardSize; y++) {
          for (let x = 0; x < this.game.boardSize; x++) {
            const cell = this.game.board[y][x];
            if (!cell.revealed && !cell.flagged) {
              unrevealedCells.push({ x, y });
            }
          }
        }

        // Shuffle the new list
        for (let i = unrevealedCells.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [unrevealedCells[i], unrevealedCells[j]] = [
            unrevealedCells[j],
            unrevealedCells[i],
          ];
        }
        i = 0;
        continue;
      }
      const cell = unrevealedCells[i++];
      this.boardUI.onLeftClick(cell.x, cell.y);
    }
  }
}

export function startRandomAI(game, boardUI) {
  const ai = new RandomAI(game, boardUI);
  ai.run();
}
