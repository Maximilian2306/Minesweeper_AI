import { stopAI } from '/src/js/ai/AIMenu.js';
import { formatTime } from '/src/js/utils/helpers.js';

const leaderboardKey = 'minesweeper-leaderboard'; // Schlüssel für die Bestenliste im Local Storage
const leaderboardList = document.getElementById('leaderboard-list'); // Bestenliste
const leaderboardListPopup = document.getElementById('leaderboard-list-popup'); // Bestenliste im Pop-up

const openLeaderboardBtn = document.getElementById('open-leaderboard-btn'); // Öffnen Button für die Bestenliste
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn'); // Schließen Button für die Bestenliste
const clearLeaderboardBtn = document.getElementById('clear-leaderboard-btn'); // Bestenliste leeren Button

const leaderboardPopup = document.getElementById('leaderboard-popup'); // Pop-up für die Bestenliste

const msgBoxWinNameInpBtn = document.getElementById('save-nameInp-btn');
const msgBoxWinNameInp = document.getElementById('game-win-nameInp');


export class Leaderboard {
  constructor(key) {
    this.storageKey = key;
  }

  async saveWinToLeaderboard(timeInSeconds) {
    msgBoxWinNameInp.style.display = 'block'; // Zeige das Eingabefeld für den Namen

    await new Promise((resolve) => {
      msgBoxWinNameInpBtn.onclick = () => {
        msgBoxWinNameInp.style.display = 'none'; // Verstecke das Eingabefeld für den Namen
        resolve();
      };
    });

    const playerNameInput = document.getElementById('nameInp');
    if (!playerNameInput || !playerNameInput.value.trim()) return;

    const newEntry = {
      name: playerNameInput.value.trim(),
      time: timeInSeconds,
    };

    let leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    leaderboard.push(newEntry);

    leaderboard.sort((a, b) => a.time - b.time);
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
    this.renderLeaderboard(); 
  }

  getEntries() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || [];
  }

  renderLeaderboard() {
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

    leaderboard.forEach((entry) => {
      const listItem1 = document.createElement('li');
      const listItem2 = document.createElement('li');

      const timeStamp = formatTime(entry.time);

      listItem1.innerHTML = `<span>${entry.name}</span><span>${timeStamp}</span>`;
      listItem2.innerHTML = `<span>${entry.name}</span><span>${timeStamp}</span>`;

      leaderboardList.appendChild(listItem1);
      leaderboardListPopup.appendChild(listItem2);
    });
  }
}



// Bind the leaderboard buttons to their respective actions


export function bindLeaderboardButtons(leaderboardInstance, game) {
  openLeaderboardBtn.addEventListener('click', () => {
    leaderboardInstance.renderLeaderboard();
    stopAI(game);
    leaderboardPopup.style.display = 'flex';
    document.body.classList.add('popup-open');
  });

  closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardPopup.style.display = 'none';
    document.body.classList.remove('popup-open');
  });

  clearLeaderboardBtn.addEventListener('click', () => {
    if (localStorage.getItem(leaderboardKey) === null) {
      alert('Die Bestenliste ist bereits leer.');
      return;
    } else {
      if (confirm('Bist du sicher, dass du die Bestenliste löschen willst?')) {
        localStorage.removeItem(leaderboardKey);
        leaderboardInstance.renderLeaderboard();
      }
    }
  });
}






