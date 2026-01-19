// Dice Farmer - Main Entry Point

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

function initGame() {
  // Try to load existing save
  const hasExistingSave = loadGame();

  if (hasExistingSave) {
    showToast('Welcome back! Game loaded.', 'success');
  } else {
    // Start fresh game
    gameState = createInitialGameState();
    showToast('Welcome to Dice Farmer! 🌱', 'success');
  }

  // Initialize UI
  updateAllDisplays();

  // Set up event listeners
  initEventListeners();
  initShopListeners();

  // Start the game at Market phase
  setPhase(PHASES.MARKET);
}

function initEventListeners() {
  // Continue button (market phase)
  document.getElementById('btn-continue').addEventListener('click', () => {
    if (gameState.phase === PHASES.MARKET) {
      setPhase(PHASES.PLANNING);
    }
  });

  // Roll dice button
  document.getElementById('btn-roll').addEventListener('click', () => {
    if (gameState.phase === PHASES.PLANNING && gameState.turnState.selectedDice.length > 0) {
      rollSelectedDice();
    }
  });

  // Auto-fill button
  document.getElementById('btn-auto-fill').addEventListener('click', () => {
    if (gameState.phase === PHASES.PLANTING) {
      autoFillCrops();
    }
  });

  // Done planting button
  document.getElementById('btn-done-planting').addEventListener('click', () => {
    if (gameState.phase === PHASES.PLANTING) {
      confirmPlanting();
    }
  });

  // Confirm watering button
  document.getElementById('btn-confirm-water').addEventListener('click', () => {
    if (gameState.phase === PHASES.WATERING) {
      confirmWatering();
    }
  });

  // End turn button
  document.getElementById('btn-end-turn').addEventListener('click', () => {
    if (gameState.phase === PHASES.SHOP) {
      endTurn();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Enter to continue/confirm
    if (e.key === 'Enter') {
      if (gameState.phase === PHASES.MARKET) {
        setPhase(PHASES.PLANNING);
      } else if (gameState.phase === PHASES.PLANTING) {
        confirmPlanting();
      } else if (gameState.phase === PHASES.WATERING) {
        confirmWatering();
      }
    }

    // Space to roll
    if (e.key === ' ' && gameState.phase === PHASES.PLANNING) {
      e.preventDefault();
      if (gameState.turnState.selectedDice.length > 0) {
        rollSelectedDice();
      }
    }

    // A for auto-fill
    if (e.key === 'a' && gameState.phase === PHASES.PLANTING) {
      autoFillCrops();
    }

    // S for shop
    if (e.key === 's' && gameState.phase === PHASES.SHOP) {
      openShop();
    }

    // Escape to close shop
    if (e.key === 'Escape') {
      closeShop();
    }
  });
}

// Reset game (for testing)
function resetGame() {
  deleteSave();
  gameState = createInitialGameState();
  updateAllDisplays();
  setPhase(PHASES.MARKET);
  showToast('Game reset!', 'info');
}

// Expose reset for console debugging
window.resetGame = resetGame;
window.gameState = gameState;
