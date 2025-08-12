import { closePopup } from '../utils/handlePopups.js';

const stopBtn = document.getElementById('stopKI');
const randomKIBtn = document.getElementById('startRandomKI');
const ruleBasedKIBtn = document.getElementById('startRuleKI');
const headerContainer = document.getElementById('header-container');
const gameIterationsLabel = document.getElementById('gameIterations');

export let aiSpeed = 0.1;
export let gameCount = 0; 

export function setAISpeed(speed) {
  aiSpeed = speed;
}

export function incrementGameCount() {
  gameCount++;
  updateGameIterationsLabel();
}

export function resetGameCount() {
  gameCount = 0;
  updateGameIterationsLabel();
}

function updateGameIterationsLabel() {
  gameIterationsLabel.textContent = gameCount;
}

export function stopAI(game) {
  if (!game) return;
  game.kiRunning = false;

  console.log("Anzahl der Spiele: " + gameCount);

  closePopup('stopKI');
  headerContainer.style.maxWidth = '360px';
  closePopup('kiMenu');
}

export function bindKIButtons({ onStartRandom, onStartRule, onStop }) {
  randomKIBtn.addEventListener('click', onStartRandom);
  ruleBasedKIBtn.addEventListener('click', onStartRule);
  stopBtn.addEventListener('click', onStop);
}
