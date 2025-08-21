import { getNeighbors, sleep } from '../utils/helpers.js';
import { aiSpeed, incrementGameCount } from './AIMenu.js';

// KI Buttons //
const stopBtn = document.getElementById('stopKI');
const headerContainer = document.getElementById('header-container');
const kiMenu = document.getElementById('kiMenu');


export class RuleBasedAI {
  constructor(game, boardUI) {
    this.game = game;
    this.boardUI = boardUI;
  }

  // Start rule-based AI
  async run() {
    if (this.game.gameOver || this.game.kiRunning) return;
    
    console.log("Aktueller Speed: " + aiSpeed);

    kiMenu.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    headerContainer.style.maxWidth = '460px';
    this.game.kiRunning = true;

    while (this.game.kiRunning) {

      if(aiSpeed > 0) {
        await sleep(aiSpeed); 
        console.log("Gemessen mit Await: " + aiSpeed);
      } else {
        console.log("Gemessen ohne Await: " + aiSpeed);
      }

      if (this.game.gameOver) {
        incrementGameCount();
        this.game.init();
        await sleep(0);
        continue;
      }

      let changed = false;
 
      // First pass: Apply basic rules
      changed = await this.applyBasicRules();

      // Second pass: Check for 1-1 patterns
      if (!changed) {
        changed = await this.check1_1Pattern();
      }

      // Third pass: Check for 1-2-1 patterns
      if (!changed) {
        changed = await this.check1_2_1Pattern();
      }

      // Fourth pass: Check other advanced patterns
      if (!changed) {
        changed = await this.checkAdvancedPatterns();
      }

      // Final fallback: If no rules applied, make a safe guess
      if (!changed) {
        const safeGuess = await this.findSafeGuess();
        if (safeGuess) {
          this.boardUI.onLeftClick(safeGuess.x, safeGuess.y);
          changed = true;
        } else {
          const bestGuess = await this.pickBestUnrevealed();
          if (bestGuess) {
            this.boardUI.onLeftClick(bestGuess.x, bestGuess.y);
            changed = true;
          } else {
            this.game.kiRunning = false;
            stopBtn.style.display = 'none';
            headerContainer.style.maxWidth = '360px';
            break;
          }
        }
      }
    }
  }

  // Apply basic rules to reveal or flag cells
  async applyBasicRules() {
    let changed = false;

    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        const cell = this.game.board[y][x];
        if (!cell.revealed || cell.number === 0) continue;

        const neighbors = getNeighbors(x, y, this.game);
        const flagged = neighbors.filter((n) => n.flagged).length;
        const hidden = neighbors.filter((n) => !n.revealed && !n.flagged);

        // Rule 1: If flagged count equals cell number, reveal remaining hidden neighbors
        if (flagged === cell.number && hidden.length > 0) {
          for (const n of hidden) {
            this.boardUI.onLeftClick(n.x, n.y);
            changed = true;
            if (aiSpeed > 0) {
              await sleep(aiSpeed); 
            }
          }
          continue; // Skip to next cell after changes
        }

        // Rule 2: If hidden count equals remaining mines, flag all hidden
        if (hidden.length > 0 && hidden.length === cell.number - flagged) {
          for (const n of hidden) {
            if (!n.flagged) {
              // this.boardUI.onLeftClick(n.x, n.y);
              this.boardUI.onRightClick(n.x, n.y); // wenn BoardUI das unterstützt
              changed = true;
              if (aiSpeed > 0) {
                await sleep(aiSpeed); 
              }
            }
          }
        }
      }
    }

    return changed;
  }

  // Check for 1-1 pattern (common minesweeper pattern)
  async check1_1Pattern() {
    let changed = false;

    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        const cell = this.game.board[y][x];
        if (!cell.revealed || cell.number !== 1) continue;

        const neighbors = getNeighbors(x, y, this.game);
        const hidden = neighbors.filter((n) => !n.revealed && !n.flagged);

        if (hidden.length !== 2) continue;

        // Check if this cell shares one hidden neighbor with another '1' cell
        for (const n of neighbors) {
          if (n.revealed && n.number === 1) {
            const sharedNeighbors = getNeighbors(n.x, n.y, this.game);
            const sharedHidden = sharedNeighbors.filter(
              (sn) => !sn.revealed && !sn.flagged
            );

            if (sharedHidden.length === 2) {
              const sharedCell = hidden.find((h) => sharedHidden.includes(h));
              if (sharedCell) {
                // The non-shared cell must be safe
                const safeCell =
                  hidden.find((h) => h !== sharedCell) ||
                  sharedHidden.find((sh) => sh !== sharedCell);
                if (safeCell && !safeCell.flagged) {
                  this.boardUI.onLeftClick(safeCell.x, safeCell.y);
                  changed = true;
                  if (aiSpeed > 0) {
                    await sleep(aiSpeed); 
                  }
                  return changed; // Return early to re-evaluate board
                }
              }
            }
          }
        }
      }
    }

    return changed;
  }

  // Check for 1-2-1 pattern (horizontal and vertical)
  async check1_2_1Pattern() {
    let changed = false;

    // Check for horizontal 1-2-1 pattern
    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 1; x < this.game.boardSize - 2; x++) {
        const leftCell = this.game.board[y][x];
        const middleCell = this.game.board[y][x + 1];
        const rightCell = this.game.board[y][x + 2];

        if (!leftCell.revealed || !middleCell.revealed || !rightCell.revealed)
          continue;
        if (
          leftCell.number !== 1 ||
          middleCell.number !== 2 ||
          rightCell.number !== 1
        )
          continue;

        // Get the three hidden cells above and below this pattern
        const topCells = [
          y > 0 ? this.game.board[y - 1][x] : null,
          y > 0 ? this.game.board[y - 1][x + 1] : null,
          y > 0 ? this.game.board[y - 1][x + 2] : null,
        ].filter((c) => c && !c.revealed && !c.flagged);

        const bottomCells = [
          y < this.game.boardSize - 1 ? this.game.board[y + 1][x] : null,
          y < this.game.boardSize - 1 ? this.game.board[y + 1][x + 1] : null,
          y < this.game.boardSize - 1 ? this.game.board[y + 1][x + 2] : null,
        ].filter((c) => c && !c.revealed && !c.flagged);

        // In a 1-2-1 pattern, the middle cell of the opposite side is safe
        if (topCells.length === 3 && bottomCells.length === 3) {
          // Check which side has the mines
          const leftHidden = getNeighbors(x, y, this.game).filter(
            (n) => !n.revealed && !n.flagged
          );
          const rightHidden = getNeighbors(x + 2, y, this.game).filter(
            (n) => !n.revealed && !n.flagged
          );

          if (leftHidden.length === 2 && rightHidden.length === 2) {
            // The center cell on the opposite side is safe
            const safeCell = this.game.board[y + 1]
              ? this.game.board[y + 1][x + 1]
              : this.game.board[y - 1][x + 1];
            if (safeCell && !safeCell.revealed && !safeCell.flagged) {
              this.boardUI.onLeftClick(safeCell.x, safeCell.y);
              changed = true;
              if (aiSpeed > 0) {
                await sleep(aiSpeed); 
              }
              return changed;
            }
          }
        }
      }
    }

    // Check for vertical 1-2-1 pattern (same logic but vertical)
    for (let y = 1; y < this.game.boardSize - 2; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        const topCell = this.game.board[y][x];
        const middleCell = this.game.board[y + 1][x];
        const bottomCell = this.game.board[y + 2][x];

        if (!topCell.revealed || !middleCell.revealed || !bottomCell.revealed)
          continue;
        if (
          topCell.number !== 1 ||
          middleCell.number !== 2 ||
          bottomCell.number !== 1
        )
          continue;

        // Get the three hidden cells left and right of this pattern
        const leftCells = [
          x > 0 ? this.game.board[y][x - 1] : null,
          x > 0 ? this.game.board[y + 1][x - 1] : null,
          x > 0 ? this.game.board[y + 2][x - 1] : null,
        ].filter((c) => c && !c.revealed && !c.flagged);

        const rightCells = [
          x < this.game.boardSize - 1 ? this.game.board[y][x + 1] : null,
          x < this.game.boardSize - 1 ? this.game.board[y + 1][x + 1] : null,
          x < this.game.boardSize - 1 ? this.game.board[y + 2][x + 1] : null,
        ].filter((c) => c && !c.revealed && !c.flagged);

        if (leftCells.length === 3 && rightCells.length === 3) {
          // Check which side has the mines
          const topHidden = getNeighbors(x, y, this.game).filter(
            (n) => !n.revealed && !n.flagged
          );
          const bottomHidden = getNeighbors(x, y + 2, this.game).filter(
            (n) => !n.revealed && !n.flagged
          );

          if (topHidden.length === 2 && bottomHidden.length === 2) {
            // The center cell on the opposite side is safe
            const safeCell = this.game.board[y + 1][x + 1] || this.game.board[y + 1][x - 1];
            if (safeCell && !safeCell.revealed && !safeCell.flagged) {
              this.boardUI.onLeftClick(safeCell.x, safeCell.y);
              changed = true;
              if (aiSpeed > 0) {
                await sleep(aiSpeed); 
              }
              return changed;
            }
          }
        }
      }
    }

    return changed;
  }

  // Check for advanced patterns
  async checkAdvancedPatterns() {
    let changed = false;

    // Pattern 1: 1-1 pattern (common minesweeper pattern)
    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        const cell = this.game.board[y][x];
        if (!cell.revealed || cell.number !== 1) continue;

        const neighbors = getNeighbors(x, y, this.game);
        const hidden = neighbors.filter((n) => !n.revealed && !n.flagged);

        if (hidden.length !== 2) continue;

        // Check if this cell shares one hidden neighbor with another '1' cell
        for (const n of neighbors) {
          if (n.revealed && n.number === 1) {
            const sharedNeighbors = getNeighbors(n.x, n.y, this.game);
            const sharedHidden = sharedNeighbors.filter(
              (sn) => !sn.revealed && !sn.flagged
            );

            if (
              sharedHidden.length === 2 &&
              (sharedHidden[0] === hidden[0] ||
                sharedHidden[0] === hidden[1] ||
                sharedHidden[1] === hidden[0] ||
                sharedHidden[1] === hidden[1])
            ) {
              // The non-shared cell must be safe
              const safeCell = sharedHidden.find((sn) => !hidden.includes(sn));
              if (safeCell) {
                this.boardUI.onLeftClick(safeCell.x, safeCell.y);
                changed = true;
                if (aiSpeed > 0) {
                  await sleep(aiSpeed); 
                }
                return changed; // Return early to re-evaluate board
              }
            }
          }
        }
      }
    }

    return changed;
  }
  
  // Find a safe guess based on the current board state
  async findSafeGuess() {
    // First try to find a cell with 0 probability of being a mine
    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        const cell = this.game.board[y][x];
        if (cell.revealed || cell.flagged) continue;

        const neighbors = getNeighbors(x, y, this.game);
        const revealedNeighbors = neighbors.filter((n) => n.revealed);

        // If all revealed neighbors are 0, it's safe
        if (
          revealedNeighbors.length > 0 &&
          revealedNeighbors.every((n) => n.number === 0)
        ) {
          return cell;
        }
      }
    }
    return null;
  }

  // Pick the best unrevealed cell based on mine probability
  async pickBestUnrevealed() {
    let bestCell = null;
    let lowestProbability = 1;

    // Calculate mine probability for each unrevealed cell
    for (let y = 0; y < this.game.boardSize; y++) {
      for (let x = 0; x < this.game.boardSize; x++) {
        const cell = this.game.board[y][x];
        if (cell.revealed || cell.flagged) continue;

        const neighbors = getNeighbors(x, y, this.game);
        const revealedNeighbors = neighbors.filter(
          (n) => n.revealed && n.number > 0
        );

        if (revealedNeighbors.length === 0) {
          // No information, return this cell if we haven't found anything better
          if (!bestCell) {
            bestCell = cell;
          }
          continue;
        }

        // Calculate probability based on neighboring numbers
        let totalPossibleMines = 0;
        let totalConstraints = 0;

        for (const n of revealedNeighbors) {
          const nNeighbors = getNeighbors(n.x, n.y, this.game);
          const hiddenAroundN = nNeighbors.filter(
            (nn) => !nn.revealed && !nn.flagged
          );
          const flaggedAroundN = nNeighbors.filter((nn) => nn.flagged).length;
          const remainingMines = n.number - flaggedAroundN;

          if (hiddenAroundN.length > 0) {
            totalPossibleMines += remainingMines;
            totalConstraints += hiddenAroundN.length;
          }
        }

        const probability =
          totalConstraints > 0 ? totalPossibleMines / totalConstraints : 0;

        if (probability < lowestProbability) {
          lowestProbability = probability;
          bestCell = cell;
        }
      }
    }
    return bestCell;
  }
}

export function startRuleAI(game, boardUI) {
  const ai = new RuleBasedAI(game, boardUI);
  ai.run();
}
