import { openPopup, closePopup } from '../utils/handlePopups.js';
import { setAISpeed, resetGameCount } from '../ai/AIMenu.js';

export function bindHeaderControls({ onRestart, onModeChange }) {
  const restartBtn = document.getElementById('restart-btn');
  const startBtn = document.getElementById('start-btn');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const kiButton = document.getElementById('kiActBtn');
  const kiMenu = document.getElementById('kiMenu');
  const boardElement = document.getElementById('game-board');
  const mineCounter = document.getElementById('mine-count');
  const timerDisplay = document.getElementById('timer');

  const customSizeInput = document.getElementById('custom-size');
  const customMinesInput = document.getElementById('custom-mines');
  const customStartBtn = document.getElementById('start-custom-game-btn');
  const customCloseBtn = document.getElementById('cancel-custom-game-btn');

  const mineIconButton = document.getElementById('mineIconButton');
  let currentMineIconIndex = 0;

  const kiSpeedInput = document.getElementById('kiSpeed');
  const kiSpeedValue = document.getElementById('kiSpeedValue');

  // Event listeners for header controls
  restartBtn.addEventListener('click', () => {
    timerDisplay.textContent = '00:00';
    resetGameCount();
    onRestart();
  });

  startBtn.addEventListener('click', () => {
    openPopup('mode-popup', 'flex', true);
  });

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const size = parseInt(button.getAttribute('data-size'), 10);
      const mines = parseInt(button.getAttribute('data-mines'), 10);

      if (isNaN(size) || isNaN(mines)) {
        openPopup('custom-game-popup', 'flex', true);
        closePopup('mode-popup');
        return;
      }

      boardElement.style.gridTemplateColumns = `repeat(${size}, 30px)`;
      boardElement.style.gridTemplateRows = `repeat(${size}, 30px)`;

      resetGameCount();
      onModeChange({ size, mines });
      closePopup('mode-popup');
      timerDisplay.textContent = '00:00';
      mineCounter.textContent = `Minen: ${mines}`;
    });
  });

  customStartBtn.addEventListener('click', () => {
    const size = parseInt(customSizeInput.value, 10);
    const mines = parseInt(customMinesInput.value, 10);

    if (size > 0 && size < 101 && mines > 0 && size * size > mines) {
      boardElement.style.gridTemplateColumns = `repeat(${size}, 30px)`;
      boardElement.style.gridTemplateRows = `repeat(${size}, 30px)`;

      resetGameCount();
      onModeChange({ size, mines });
      closePopup('custom-game-popup');
      timerDisplay.textContent = '00:00';
      mineCounter.textContent = `Minen: ${mines}`;
    }
  });

  customCloseBtn.addEventListener('click', () => {
    closePopup('custom-game-popup');
  });

  mineIconButton.addEventListener('click', () => {
    const mineIcons = [
      './assets/Pictures/Bomb1.jpeg',
      './assets/Pictures/Bomb.jpg',
      './assets/Pictures/Bomb2.jpg',
      './assets/Pictures/Bomb3.webp',
    ];
    currentMineIconIndex = (currentMineIconIndex + 1) % mineIcons.length;

    const mineIconImg = document.getElementById('mineIconImg');
    mineIconImg.src = mineIcons[currentMineIconIndex];

    document.documentElement.style.setProperty(
      '--mine-icon-url',
      `url('.${mineIcons[currentMineIconIndex]}')`
    );
  });

  kiButton.addEventListener('click', () => {
    const kiMenuStyle = getComputedStyle(kiMenu);

    if (kiMenuStyle.display === 'none') {
      const rect = kiButton.getBoundingClientRect();
      kiMenu.style.left = `${rect.left}px`;
      kiMenu.style.top = `${rect.bottom + window.scrollY}px`;
      openPopup('kiMenu', 'block', false);
    } else {
      closePopup('kiMenu');
    }
  });


  kiSpeedInput.addEventListener('input', () => {
    const speed = parseFloat(kiSpeedInput.value);
    console.log(`KI-Geschwindigkeit geändert: ${speed}s`);
    setAISpeed(speed);
    kiSpeedValue.textContent = speed.toFixed(2) + 's';
  });
}
