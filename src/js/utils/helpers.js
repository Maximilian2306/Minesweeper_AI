// Helper function to format time in MM:SS
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Helper function to wait for a specified time
export function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// Helper function to find neighbors of a cell
export function getNeighbors(x, y, game) {
  const neighbors = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < game.boardSize && ny >= 0 && ny < game.boardSize) {
        const neighbor = game.board[ny][nx];
        neighbors.push({ ...neighbor, x: nx, y: ny }); 
      }
    }
  }
  return neighbors;
}


