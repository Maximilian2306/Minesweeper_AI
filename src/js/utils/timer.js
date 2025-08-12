const timerDisplay = document.getElementById('timer'); 


export function updateTimer(game) {
  if (!game.startTime) {
    game.startTime = Date.now();
  }

  const now = Date.now();
  const elapsedTime = Math.floor((now - game.startTime) / 1000);

  const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
  const seconds = (elapsedTime % 60).toString().padStart(2, '0');

  timerDisplay.textContent = `${minutes}:${seconds}`;
}

