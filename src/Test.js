
// Erste Claude Lösung
/*
// Verbesserte regelbasierte KI Button
ruleBasedKIBtn.addEventListener("click", async () => {
  if (gameOver || kiRunning) return;

  kiMenu.style.display = "none";
  stopBtn.style.display = "inline-block";
  headerContainer.style.maxWidth = "460px";
  kiRunning = true;

  while (kiRunning) {
    await sleep(0.1);

    if (gameOver) {
      init();
      await sleep(1);
      continue;
    }

    const move = findBestMove();
    
    if (move) {
      if (move.type === 'reveal') {
        handleLeftClick(move.x, move.y);
      } else if (move.type === 'flag') {
        handleRightClick(move.x, move.y);
      }
      await sleep(50);
    } else {
      // Kein sicherer Zug gefunden, beende KI
      kiRunning = false;
      stopBtn.style.display = "none";
      headerContainer.style.maxWidth = "360px";
      break;
    }
  }
});

// Hauptfunktion zum Finden des besten Zuges
function findBestMove() {
  // 1. Einfache Regeln anwenden
  let move = applySimpleRules();
  if (move) return move;

  // 2. Erweiterte Mustererkennung
  move = applyPatternRecognition();
  if (move) return move;

  // 3. Constraint Satisfaction Problem (CSP) lösen
  move = solveCSP();
  if (move) return move;

  // 4. Wahrscheinlichkeitsbasierte Entscheidung
  move = makeProbabilisticMove();
  if (move) return move;

  return null; // Kein Zug möglich
}

// Einfache Regeln (wie in der ursprünglichen Version)
function applySimpleRules() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.revealed || cell.number === 0) continue;

      const neighbors = getNeighbors(x, y);
      const flagged = neighbors.filter(n => n.flagged).length;
      const hidden = neighbors.filter(n => !n.revealed && !n.flagged);

      // Regel 1: Alle Minen gefunden -> andere Felder aufdecken
      if (flagged === cell.number) {
        for (const n of hidden) {
          return { type: 'reveal', x: n.x, y: n.y };
        }
      }

      // Regel 2: Alle versteckten Felder sind Minen -> markieren
      if (hidden.length > 0 && hidden.length === (cell.number - flagged)) {
        for (const n of hidden) {
          return { type: 'flag', x: n.x, y: n.y };
        }
      }
    }
  }
  return null;
}

// Erweiterte Mustererkennung
function applyPatternRecognition() {
  // 1-2-1 Muster erkennen
  const pattern121 = detect121Pattern();
  if (pattern121) return pattern121;

  // 1-2-2-1 Muster erkennen
  const pattern1221 = detect1221Pattern();
  if (pattern1221) return pattern1221;

  return null;
}

// 1-2-1 Muster Erkennung
function detect121Pattern() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize - 2; x++) {
      // Horizontal 1-2-1
      if (board[y][x].revealed && board[y][x].number === 1 &&
          board[y][x + 1].revealed && board[y][x + 1].number === 2 &&
          board[y][x + 2].revealed && board[y][x + 2].number === 1) {
        
        const move = analyze121Pattern(x, y, 'horizontal');
        if (move) return move;
      }
    }
  }

  for (let y = 0; y < boardSize - 2; y++) {
    for (let x = 0; x < boardSize; x++) {
      // Vertikal 1-2-1
      if (board[y][x].revealed && board[y][x].number === 1 &&
          board[y + 1][x].revealed && board[y + 1][x].number === 2 &&
          board[y + 2][x].revealed && board[y + 2][x].number === 1) {
        
        const move = analyze121Pattern(x, y, 'vertical');
        if (move) return move;
      }
    }
  }
  return null;
}

function analyze121Pattern(x, y, direction) {
  if (direction === 'horizontal') {
    // Prüfe die Ecken des 1-2-1 Musters
    const corners = [
      { x: x - 1, y: y - 1 }, { x: x + 3, y: y - 1 },
      { x: x - 1, y: y + 1 }, { x: x + 3, y: y + 1 }
    ];
    
    for (const corner of corners) {
      if (isValidPosition(corner.x, corner.y) && 
          !board[corner.y][corner.x].revealed && 
          !board[corner.y][corner.x].flagged) {
        return { type: 'reveal', x: corner.x, y: corner.y };
      }
    }
  } else if (direction === 'vertical') {
    const corners = [
      { x: x - 1, y: y - 1 }, { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 3 }, { x: x + 1, y: y + 3 }
    ];
    
    for (const corner of corners) {
      if (isValidPosition(corner.x, corner.y) && 
          !board[corner.y][corner.x].revealed && 
          !board[corner.y][corner.x].flagged) {
        return { type: 'reveal', x: corner.x, y: corner.y };
      }
    }
  }
  return null;
}

// 1-2-2-1 Muster Erkennung
function detect1221Pattern() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize - 3; x++) {
      if (board[y][x].revealed && board[y][x].number === 1 &&
          board[y][x + 1].revealed && board[y][x + 1].number === 2 &&
          board[y][x + 2].revealed && board[y][x + 2].number === 2 &&
          board[y][x + 3].revealed && board[y][x + 3].number === 1) {
        
        const move = analyze1221Pattern(x, y, 'horizontal');
        if (move) return move;
      }
    }
  }
  return null;
}

function analyze1221Pattern(x, y, direction) {
  // Spezifische Logik für 1-2-2-1 Muster
  const middlePositions = [
    { x: x + 1, y: y - 1 }, { x: x + 2, y: y - 1 },
    { x: x + 1, y: y + 1 }, { x: x + 2, y: y + 1 }
  ];
  
  for (const pos of middlePositions) {
    if (isValidPosition(pos.x, pos.y) && 
        !board[pos.y][pos.x].revealed && 
        !board[pos.y][pos.x].flagged) {
      return { type: 'flag', x: pos.x, y: pos.y };
    }
  }
  return null;
}

// Constraint Satisfaction Problem lösen
function solveCSP() {
  const constraints = buildConstraints();
  const solution = solveConstraints(constraints);
  
  if (solution) {
    for (const cell of solution.safeCells) {
      if (!board[cell.y][cell.x].revealed) {
        return { type: 'reveal', x: cell.x, y: cell.y };
      }
    }
    for (const cell of solution.mineCells) {
      if (!board[cell.y][cell.x].flagged) {
        return { type: 'flag', x: cell.x, y: cell.y };
      }
    }
  }
  return null;
}

function buildConstraints() {
  const constraints = [];
  
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.revealed || cell.number === 0) continue;

      const neighbors = getNeighbors(x, y);
      const unknownNeighbors = neighbors.filter(n => !n.revealed && !n.flagged);
      const flaggedCount = neighbors.filter(n => n.flagged).length;
      
      if (unknownNeighbors.length > 0) {
        constraints.push({
          cells: unknownNeighbors,
          mineCount: cell.number - flaggedCount
        });
      }
    }
  }
  
  return constraints;
}

function solveConstraints(constraints) {
  // Vereinfachte CSP-Lösung
  for (const constraint of constraints) {
    if (constraint.mineCount === 0) {
      return { safeCells: constraint.cells, mineCells: [] };
    }
    if (constraint.mineCount === constraint.cells.length) {
      return { safeCells: [], mineCells: constraint.cells };
    }
  }
  
  // Erweiterte Constraint-Analyse
  return analyzeConstraintIntersections(constraints);
}

function analyzeConstraintIntersections(constraints) {
  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      const c1 = constraints[i];
      const c2 = constraints[j];
      
      const intersection = c1.cells.filter(cell => 
        c2.cells.some(c => c.x === cell.x && c.y === cell.y)
      );
      
      if (intersection.length > 0) {
        const result = analyzeIntersection(c1, c2, intersection);
        if (result) return result;
      }
    }
  }
  return null;
}

function analyzeIntersection(c1, c2, intersection) {
  const c1Only = c1.cells.filter(cell => 
    !intersection.some(i => i.x === cell.x && i.y === cell.y)
  );
  const c2Only = c2.cells.filter(cell => 
    !intersection.some(i => i.x === cell.x && i.y === cell.y)
  );
  
  // Wenn die Differenz der Minenzahlen gleich der Differenz der Zellenzahlen ist
  const mineDiff = c1.mineCount - c2.mineCount;
  const cellDiff = c1Only.length - c2Only.length;
  
  if (mineDiff === cellDiff && mineDiff > 0) {
    return { safeCells: c2Only, mineCells: c1Only };
  } else if (mineDiff === cellDiff && mineDiff < 0) {
    return { safeCells: c1Only, mineCells: c2Only };
  }
  
  return null;
}

// Wahrscheinlichkeitsbasierte Entscheidung
function makeProbabilisticMove() {
  const probabilities = calculateProbabilities();
  const safestCell = findSafestCell(probabilities);
  
  if (safestCell && safestCell.probability < 0.5) {
    return { type: 'reveal', x: safestCell.x, y: safestCell.y };
  }
  
  return null;
}

function calculateProbabilities() {
  const probabilities = [];
  
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (!board[y][x].revealed && !board[y][x].flagged) {
        const probability = calculateCellProbability(x, y);
        probabilities.push({ x, y, probability });
      }
    }
  }
  
  return probabilities;
}

function calculateCellProbability(x, y) {
  const neighbors = getNeighbors(x, y);
  const revealedNeighbors = neighbors.filter(n => n.revealed && n.number > 0);
  
  if (revealedNeighbors.length === 0) {
    // Globale Wahrscheinlichkeit basierend auf verbleibenden Minen
    const totalCells = boardSize * boardSize;
    const revealedCells = board.flat().filter(cell => cell.revealed).length;
    const flaggedCells = board.flat().filter(cell => cell.flagged).length;
    const remainingCells = totalCells - revealedCells - flaggedCells;
    const remainingMines = mineCount - flaggedCells;
    
    return remainingMines / remainingCells;
  }
  
  // Lokale Wahrscheinlichkeit basierend auf Nachbarn
  let totalProbability = 0;
  let validNeighbors = 0;
  
  for (const neighbor of revealedNeighbors) {
    const nNeighbors = getNeighbors(neighbor.x, neighbor.y);
    const nFlagged = nNeighbors.filter(n => n.flagged).length;
    const nHidden = nNeighbors.filter(n => !n.revealed && !n.flagged).length;
    
    if (nHidden > 0) {
      const probability = (neighbor.number - nFlagged) / nHidden;
      totalProbability += probability;
      validNeighbors++;
    }
  }
  
  return validNeighbors > 0 ? totalProbability / validNeighbors : 0.5;
}

function findSafestCell(probabilities) {
  if (probabilities.length === 0) return null;
  
  return probabilities.reduce((safest, current) => 
    current.probability < safest.probability ? current : safest
  );
}

// Hilfsfunktion zur Positionsprüfung
function isValidPosition(x, y) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}


*/




































// Erste DeepSeek Lösung
/*
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

    // First pass: Apply basic rules
    changed = await applyBasicRules();

     // Second pass: Check for 1-1 patterns
    if (!changed) {
      changed = await check1_1Pattern();
    }

    // Third pass: Check for 1-2-1 patterns
    if (!changed) {
      changed = await check1_2_1Pattern();
    }

    // Fourth pass: Check other advanced patterns
    if (!changed) {
      changed = await checkAdvancedPatterns();
    }

    // Final fallback: If no rules applied, make a safe guess
    if (!changed) {
      const safeGuess = findSafeGuess();
      if (safeGuess) {
        handleLeftClick(safeGuess.x, safeGuess.y);
        changed = true;
      } else {
        const bestGuess = pickBestUnrevealed();
        if (bestGuess) {
          handleLeftClick(bestGuess.x, bestGuess.y);
          changed = true;
        } else {
          kiRunning = false;
          stopBtn.style.display = "none";
          headerContainer.style.maxWidth = "360px";
          break;
        }
      }
    }
  }
});

async function applyBasicRules() {
  let changed = false;
  
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.revealed || cell.number === 0) continue;

      const neighbors = getNeighbors(x, y);
      const flagged = neighbors.filter(n => n.flagged).length;
      const hidden = neighbors.filter(n => !n.revealed && !n.flagged);

      // Rule 1: If flagged count equals cell number, reveal remaining hidden neighbors
      if (flagged === cell.number && hidden.length > 0) {
        for (const n of hidden) {
          handleLeftClick(n.x, n.y);
          changed = true;
          await sleep(50);
        }
        continue; // Skip to next cell after changes
      }

      // Rule 2: If hidden count equals remaining mines, flag all hidden
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
  
  return changed;
}

async function check1_1Pattern() {
  let changed = false;
  
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.revealed || cell.number !== 1) continue;
      
      const neighbors = getNeighbors(x, y);
      const hidden = neighbors.filter(n => !n.revealed && !n.flagged);
      
      if (hidden.length !== 2) continue;
      
      // Check if this cell shares one hidden neighbor with another '1' cell
      for (const n of neighbors) {
        if (n.revealed && n.number === 1) {
          const sharedNeighbors = getNeighbors(n.x, n.y);
          const sharedHidden = sharedNeighbors.filter(sn => !sn.revealed && !sn.flagged);
          
          if (sharedHidden.length === 2) {
            const sharedCell = hidden.find(h => sharedHidden.includes(h));
            if (sharedCell) {
              // The non-shared cell must be safe
              const safeCell = hidden.find(h => h !== sharedCell) || 
                             sharedHidden.find(sh => sh !== sharedCell);
              if (safeCell && !safeCell.flagged) {
                handleLeftClick(safeCell.x, safeCell.y);
                changed = true;
                await sleep(50);
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

async function check1_2_1Pattern() {
  let changed = false;
  
  // Check for horizontal 1-2-1 pattern
  for (let y = 0; y < boardSize; y++) {
    for (let x = 1; x < boardSize - 2; x++) {
      const leftCell = board[y][x];
      const middleCell = board[y][x+1];
      const rightCell = board[y][x+2];
      
      if (!leftCell.revealed || !middleCell.revealed || !rightCell.revealed) continue;
      if (leftCell.number !== 1 || middleCell.number !== 2 || rightCell.number !== 1) continue;
      
      // Get the three hidden cells above and below this pattern
      const topCells = [
        y > 0 ? board[y-1][x] : null,
        y > 0 ? board[y-1][x+1] : null,
        y > 0 ? board[y-1][x+2] : null
      ].filter(c => c && !c.revealed && !c.flagged);
      
      const bottomCells = [
        y < boardSize-1 ? board[y+1][x] : null,
        y < boardSize-1 ? board[y+1][x+1] : null,
        y < boardSize-1 ? board[y+1][x+2] : null
      ].filter(c => c && !c.revealed && !c.flagged);
      
      // In a 1-2-1 pattern, the middle cell of the opposite side is safe
      if (topCells.length === 3 && bottomCells.length === 3) {
        // Check which side has the mines
        const leftHidden = getNeighbors(x, y).filter(n => !n.revealed && !n.flagged);
        const rightHidden = getNeighbors(x+2, y).filter(n => !n.revealed && !n.flagged);
        
        if (leftHidden.length === 2 && rightHidden.length === 2) {
          // The center cell on the opposite side is safe
          const safeCell = board[y+1] ? board[y+1][x+1] : board[y-1][x+1];
          if (safeCell && !safeCell.revealed && !safeCell.flagged) {
            handleLeftClick(safeCell.x, safeCell.y);
            changed = true;
            await sleep(50);
            return changed;
          }
        }
      }
    }
  }
  
  // Check for vertical 1-2-1 pattern (same logic but vertical)
  for (let y = 1; y < boardSize - 2; y++) {
    for (let x = 0; x < boardSize; x++) {
      const topCell = board[y][x];
      const middleCell = board[y+1][x];
      const bottomCell = board[y+2][x];
      
      if (!topCell.revealed || !middleCell.revealed || !bottomCell.revealed) continue;
      if (topCell.number !== 1 || middleCell.number !== 2 || bottomCell.number !== 1) continue;
      
      // Get the three hidden cells left and right of this pattern
      const leftCells = [
        x > 0 ? board[y][x-1] : null,
        x > 0 ? board[y+1][x-1] : null,
        x > 0 ? board[y+2][x-1] : null
      ].filter(c => c && !c.revealed && !c.flagged);
      
      const rightCells = [
        x < boardSize-1 ? board[y][x+1] : null,
        x < boardSize-1 ? board[y+1][x+1] : null,
        x < boardSize-1 ? board[y+2][x+1] : null
      ].filter(c => c && !c.revealed && !c.flagged);
      
      if (leftCells.length === 3 && rightCells.length === 3) {
        // Check which side has the mines
        const topHidden = getNeighbors(x, y).filter(n => !n.revealed && !n.flagged);
        const bottomHidden = getNeighbors(x, y+2).filter(n => !n.revealed && !n.flagged);
        
        if (topHidden.length === 2 && bottomHidden.length === 2) {
          // The center cell on the opposite side is safe
          const safeCell = board[y+1][x+1] || board[y+1][x-1];
          if (safeCell && !safeCell.revealed && !safeCell.flagged) {
            handleLeftClick(safeCell.x, safeCell.y);
            changed = true;
            await sleep(50);
            return changed;
          }
        }
      }
    }
  }
  
  return changed;
}

async function checkAdvancedPatterns() {
  let changed = false;
  
  // Pattern 1: 1-1 pattern (common minesweeper pattern)
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.revealed || cell.number !== 1) continue;
      
      const neighbors = getNeighbors(x, y);
      const hidden = neighbors.filter(n => !n.revealed && !n.flagged);
      
      if (hidden.length !== 2) continue;
      
      // Check if this cell shares one hidden neighbor with another '1' cell
      for (const n of neighbors) {
        if (n.revealed && n.number === 1) {
          const sharedNeighbors = getNeighbors(n.x, n.y);
          const sharedHidden = sharedNeighbors.filter(sn => !sn.revealed && !sn.flagged);
          
          if (sharedHidden.length === 2 && 
              (sharedHidden[0] === hidden[0] || sharedHidden[0] === hidden[1] || 
               sharedHidden[1] === hidden[0] || sharedHidden[1] === hidden[1])) {
            // The non-shared cell must be safe
            const safeCell = sharedHidden.find(sn => !hidden.includes(sn));
            if (safeCell) {
              handleLeftClick(safeCell.x, safeCell.y);
              changed = true;
              await sleep(50);
              return changed; // Return early to re-evaluate board
            }
          }
        }
      }
    }
  }
  
  return changed;
}

function findSafeGuess() {
  // First try to find a cell with 0 probability of being a mine
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (cell.revealed || cell.flagged) continue;
      
      const neighbors = getNeighbors(x, y);
      const revealedNeighbors = neighbors.filter(n => n.revealed);
      
      // If all revealed neighbors are 0, it's safe
      if (revealedNeighbors.length > 0 && revealedNeighbors.every(n => n.number === 0)) {
        return cell;
      }
    }
  }
  
  return null;
}

function pickBestUnrevealed() {
  // Create a probability map for all cells
  const probabilityMap = Array(boardSize).fill().map(() => Array(boardSize).fill(0.5));
  let totalMinesLeft = totalMines - countFlaggedCells();
  
  // First pass: Calculate probabilities based on adjacent numbers
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.revealed || cell.number === 0) continue;
      
      const neighbors = getNeighbors(x, y);
      const hiddenNeighbors = neighbors.filter(n => !n.revealed && !n.flagged);
      const flaggedNeighbors = neighbors.filter(n => n.flagged).length;
      const remainingMines = cell.number - flaggedNeighbors;
      
      if (hiddenNeighbors.length > 0 && remainingMines > 0) {
        const probability = remainingMines / hiddenNeighbors.length;
        for (const n of hiddenNeighbors) {
          // Take the maximum probability for each cell
          probabilityMap[n.y][n.x] = Math.max(probabilityMap[n.y][n.x], probability);
        }
      }
    }
  }
  
  // Second pass: Find cells with the lowest probability
  let bestCell = null;
  let lowestProbability = 1;
  let unrevealedCount = 0;
  
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (cell.revealed || cell.flagged) continue;
      
      unrevealedCount++;
      
      // Adjust probability based on remaining mines
      const adjustedProbability = Math.min(probabilityMap[y][x], totalMinesLeft / unrevealedCount);
      
      if (adjustedProbability < lowestProbability) {
        lowestProbability = adjustedProbability;
        bestCell = cell;
      }
    }
  }
  
  return bestCell;
}

function countFlaggedCells() {
  let count = 0;
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (board[y][x].flagged) count++;
    }
  }
  return count;
}
*/