// export function refreshUI() {
    
  // UI aktualisieren
//   boardUI.renderBoard();
//    // Timer zurücksetzen
//     const timerDisplay = document.getElementById('timer');
//     if (timerDisplay) {
//         timerDisplay.textContent = '00:00';
//     }

//   // Minen Counter zurücksetzen
//   const mineCounter = document.getElementById('mine-counter');
//   if (mineCounter) {
//     mineCounter.textContent = `Minen: ${game.mineCount}`;
//   }

//     // Leaderboard aktualisieren
//     const leaderboard = document.getElementById('leaderboard');
//     if (leaderboard) {
//         leaderboard.innerHTML = '';
//         game.leaderboard.forEach((entry) => {
//             const li = document.createElement('li');
//             li.textContent = `${entry.name}: ${entry.time} Sekunden`;
//             leaderboard.appendChild(li);
//         });
//     }
//     // Reset KI-Status
//     const kiStatus = document.getElementById('ki-status');
//     if (kiStatus) {
//         kiStatus.textContent = 'KI ist gestoppt';
//     }
//     // Reset KI-Button
//     const startKiBtn = document.getElementById('start-ki-btn');
//     if (startKiBtn) {
//         startKiBtn.textContent = 'Start KI';
//         startKiBtn.disabled = false;
//     }
//     // Reset Restart Button
//     const restartBtn = document.getElementById('restart-btn');
//     if (restartBtn) {
//         restartBtn.textContent = '🙂 Neues Spiel';
//         restartBtn.disabled = false;
//     }
//     // Reset Game Over Message
//     const gameOverMessage = document.getElementById('game-over-message');       
//     if (gameOverMessage) {
//         gameOverMessage.style.display = 'none';
//     }
//     // Reset Game Win Message
//     const gameWinMessage = document.getElementById('game-win-message');
//     if (gameWinMessage) {
//         gameWinMessage.style.display = 'none';
//     }
//     // Reset Game Over Popup
//     const gameOverPopup = document.getElementById('game-over-popup');
//     if (gameOverPopup) {
//         gameOverPopup.style.display = 'none';
//     }
//     // Reset Game Win Popup
//     const gameWinPopup = document.getElementById('game-win-popup');
//     if (gameWinPopup) {     
//         gameWinPopup.style.display = 'none';
//     }
//     // Reset Leaderboard Popup
//     const leaderboardPopup = document.getElementById('leaderboard-popup');
//     if (leaderboardPopup) {
//         leaderboardPopup.style.display = 'none';
//     }
//     // Reset Custom Game Popup
//     const customGamePopup = document.getElementById('custom-game-popup');
//     if (customGamePopup) {
//         customGamePopup.style.display = 'none';
//     }
//     // Reset Settings Popup
//     const settingsPopup = document.getElementById('settings-popup');
//     if (settingsPopup) {
//         settingsPopup.style.display = 'none';
//     }
//     // Reset About Popup    
//     const aboutPopup = document.getElementById('about-popup');
//     if (aboutPopup) {
//         aboutPopup.style.display = 'none';
//     }




    // // Reset Message Box for Game Win
    // const msgBoxWin = document.getElementById('game-win');
    // if (msgBoxWin) {
    //     msgBoxWin.style.display = 'none';
    // }
    // // Reset Message Box for Game Over
    // const msgBoxLose = document.getElementById('game-over');
    // if (msgBoxLose) {
    //     msgBoxLose.style.display = 'none';
    // }
    // // Reset Name Input for Game Win
    // const msgBoxWinNameInp = document.getElementById('game-win-nameInp');
    // if (msgBoxWinNameInp) {
    //     msgBoxWinNameInp.style.display = 'none';
    // }




    // // Reset Name Input for Game Over
    // const msgBoxLoseNameInp = document.getElementById('game-over-nameInp');
    // if (msgBoxLoseNameInp) {
    //     msgBoxLoseNameInp.style.display = 'none';
    // }
    // // Reset Save Name Button for Game Win
    // const msgBoxWinNameInpBtn = document.getElementById('save-nameInp-btn');
    // if (msgBoxWinNameInpBtn) {
    //     msgBoxWinNameInpBtn.onclick = null; // Reset the click handler
    // }
    // // Reset Save Name Button for Game Over
    // const msgBoxLoseNameInpBtn = document.getElementById('save-lose-nameInp-btn');
    // if (msgBoxLoseNameInpBtn) {
    //     msgBoxLoseNameInpBtn.onclick = null; // Reset the click handler
    // }
    // // Reset Close Button for Leaderboard
    // const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    // if (closeLeaderboardBtn) {
    //     closeLeaderboardBtn.onclick = null; // Reset the click handler
    // }
    // // Reset Clear Leaderboard Button
    // const clearLeaderboardBtn = document.getElementById('clear-leaderboard-btn');
    // if (clearLeaderboardBtn) {
    //     clearLeaderboardBtn.onclick = null; // Reset the click handler
    // }
    // // Reset Close Button for Custom Game Popup
    // const customCloseBtn = document.getElementById('cancel-custom-game-btn');
    // if (customCloseBtn) {
    //     customCloseBtn.onclick = null; // Reset the click handler
    // }
    // // Reset Close Button for Settings Popup
    // const closeSettingsBtn = document.getElementById('save-settings-btn');
    // if (closeSettingsBtn) {
    //     closeSettingsBtn.onclick = null; // Reset the click handler
    // }
    // // Reset Close Button for About Popup
    // const closeAboutBtn = document.getElementById('close-about-btn');
    // if (closeAboutBtn) {
    //     closeAboutBtn.onclick = null; // Reset the click handler
    // }
// }
// refreshUI.js
















import { closePopup } from './handlePopups.js';

export function refreshUI() {
    const popupIds = [
        'game-win',
        'game-over',
        'game-win-nameInp',
        'mode-popup',
        'custom-game-popup',
        'kiMenu'
    ];

    popupIds.forEach(id => closePopup(id));

    // If there are still open popups, close them
    document.querySelectorAll('.popup, .game-over, .game-win, .mode-popup, .custom-popup')
        .forEach(el => el.style.display = 'none');

    // Reset UI optionally
    const timerDisplay = document.getElementById('timer');
    if (timerDisplay) timerDisplay.textContent = '00:00';

    const stopBtn = document.getElementById('stopKI');
    if (stopBtn) stopBtn.style.display = 'none';
}

