



// function runRuleBasedAI() {
//   async function step() {
//     if (!kiRunning || gameOver) {
//       stopBtn.style.display = "none";
//       headerContainer.style.maxWidth = "360px"; // Header zurücksetzen
//       kiRunning = false; // Setze KI-Status zurück
//       return;
//     }

//     let changed = false;

//     for (let y = 0; y < boardSize; y++) {
//       for (let x = 0; x < boardSize; x++) {
//         const cell = board[y][x];

//         if (!cell.revealed || cell.number === 0) continue;

//         const neighbors = getNeighbors(x, y);
//         const flagged = neighbors.filter(n => n.flagged).length;
//         const hidden = neighbors.filter(n => !n.revealed && !n.flagged);

//         // Regel 1: sichere Felder aufdecken
//         if (flagged === cell.number) {
//           for (const n of hidden) {
//             if (!n.revealed) {
//               handleLeftClick(n.x, n.y);
//               changed = true;
//               await sleep(50);
//             }
//           }
//         }

//         // Regel 2: Minen markieren
//         if (hidden.length > 0 && hidden.length === (cell.number - flagged)) {
//           for (const n of hidden) {
//             if (!n.flagged) {
//               handleRightClick(n.x, n.y);
//               changed = true;
//               await sleep(50);
//             }
//           }
//         }
//       }
//     }

//     if (checkWin()) {
//       kiRunning = false;
//       stopBtn.style.display = "none";
//       headerContainer.style.maxWidth = "360px"; // Header zurücksetzen
//       // revealAllMines();
//       showWinMessage(); 

//       gameOver = true;
//       clearInterval(timerInterval);
//       return;
//     }

//     if (changed) {
//       setTimeout(step, 100);
//     } else {
//       // Optional: zufälliger Klick wenn nichts erkannt
//       const safeGuess = pickRandomUnrevealed();
//       if (safeGuess) {
//         handleLeftClick(safeGuess.x, safeGuess.y);
//         setTimeout(step, 200);
//       } else {
//         kiRunning = false;
//         stopBtn.style.display = "none";
//         headerContainer.style.maxWidth = "360px"; // Header zurücksetzen
//         return; // Keine weiteren Schritte, wenn keine unaufgedeckten Felder mehr vorhanden
//       }
//     }
//   }

//   step();
// }