// Dice Farmer - Save/Load System

const SAVE_KEY = 'diceFarmer_saveData';

function saveGame() {
  const saveData = {
    version: '1.0',
    timestamp: Date.now(),
    gameState: {
      turn: gameState.turn,
      money: gameState.money,
      xp: gameState.xp,
      level: gameState.level,
      gardenPlots: gameState.gardenPlots,
      inventory: gameState.inventory,
      marketPrices: gameState.marketPrices,
      basePrices: gameState.basePrices,
      unlockedCrops: gameState.unlockedCrops,
      upgrades: gameState.upgrades,
      achievements: gameState.achievements,
      stats: gameState.stats
    }
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('Game saved successfully');
    return true;
  } catch (e) {
    console.error('Failed to save game:', e);
    showToast('Failed to save game!', 'error');
    return false;
  }
}

function loadGame() {
  try {
    const saveDataStr = localStorage.getItem(SAVE_KEY);
    if (!saveDataStr) {
      return false;
    }

    const saveData = JSON.parse(saveDataStr);

    // Restore game state
    gameState.turn = saveData.gameState.turn || 1;
    gameState.money = saveData.gameState.money || 15;
    gameState.xp = saveData.gameState.xp || 0;
    gameState.level = saveData.gameState.level || 1;
    gameState.gardenPlots = saveData.gameState.gardenPlots || [{ id: 0, spaces: createEmptyPlot() }];
    gameState.inventory = saveData.gameState.inventory || { cropDice: ['tomato', 'corn', 'lettuce'], waterDice: 2 };
    gameState.marketPrices = saveData.gameState.marketPrices || { ...gameState.basePrices };
    gameState.basePrices = saveData.gameState.basePrices || gameState.basePrices;
    gameState.unlockedCrops = saveData.gameState.unlockedCrops || ['tomato', 'corn', 'lettuce'];
    gameState.upgrades = saveData.gameState.upgrades || [];
    gameState.achievements = saveData.gameState.achievements || [];
    gameState.stats = saveData.gameState.stats || { totalEarnings: 0, cropsHarvested: 0, turnsPlayed: 0 };

    // Reset turn state
    gameState.turnState = {
      selectedDice: [],
      diceResults: [],
      cropsToPlace: 0,
      cropTypeToPlace: null,
      waterPool: 0,
      waterUsed: 0
    };

    console.log('Game loaded successfully');
    return true;
  } catch (e) {
    console.error('Failed to load game:', e);
    return false;
  }
}

function hasSaveData() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
  console.log('Save data deleted');
}

function getSaveInfo() {
  try {
    const saveDataStr = localStorage.getItem(SAVE_KEY);
    if (!saveDataStr) return null;

    const saveData = JSON.parse(saveDataStr);
    return {
      timestamp: saveData.timestamp,
      turn: saveData.gameState.turn,
      level: saveData.gameState.level,
      money: saveData.gameState.money
    };
  } catch (e) {
    return null;
  }
}
