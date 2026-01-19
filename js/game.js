// Dice Farmer - Core Game Logic

// Crop Definitions
const CROPS = {
  tomato: {
    name: 'Tomato',
    emoji: '🍅',
    color: '#FF6347',
    basePrice: 2,
    waterNeeded: 2,
    unlockLevel: 1,
    purchaseCost: 10
  },
  corn: {
    name: 'Corn',
    emoji: '🌽',
    color: '#FFD700',
    basePrice: 3,
    waterNeeded: 2,
    unlockLevel: 1,
    purchaseCost: 10
  },
  lettuce: {
    name: 'Lettuce',
    emoji: '🥬',
    color: '#90EE90',
    basePrice: 2,
    waterNeeded: 2,
    unlockLevel: 1,
    purchaseCost: 10
  },
  carrot: {
    name: 'Carrot',
    emoji: '🥕',
    color: '#FF8C00',
    basePrice: 4,
    waterNeeded: 1,
    unlockLevel: 2,
    purchaseCost: 12
  },
  eggplant: {
    name: 'Eggplant',
    emoji: '🍆',
    color: '#8B008B',
    basePrice: 6,
    waterNeeded: 3,
    unlockLevel: 5,
    purchaseCost: 20
  }
};

// Upgrades (MVP: 3 simple ones)
const UPGRADES = {
  irrigation: {
    name: 'Irrigation System',
    cost: 60,
    description: 'Water dice minimum value = 3',
    effect: 'waterMinimum3'
  },
  compostBin: {
    name: 'Compost Bin',
    cost: 40,
    description: 'Gain $1 per discarded crop',
    effect: 'discardValue'
  },
  fertilizer: {
    name: 'Fertilizer',
    cost: 30,
    description: '+1 to all crop dice rolls',
    effect: 'diceBonus'
  }
};

// Game Phases
const PHASES = {
  MARKET: 'market',
  PLANNING: 'planning',
  PLANTING: 'planting',
  WATERING: 'watering',
  HARVEST: 'harvest',
  SHOP: 'shop'
};

// Initial Game State
function createInitialGameState() {
  return {
    turn: 1,
    money: 15,
    xp: 0,
    level: 1,
    phase: PHASES.MARKET,

    gardenPlots: [
      {
        id: 0,
        spaces: createEmptyPlot()
      }
    ],

    inventory: {
      cropDice: ['tomato', 'corn', 'lettuce'],
      waterDice: 2
    },

    marketPrices: {
      tomato: 2,
      corn: 3,
      lettuce: 2,
      carrot: 4,
      eggplant: 6
    },

    basePrices: {
      tomato: 2,
      corn: 3,
      lettuce: 2,
      carrot: 4,
      eggplant: 6
    },

    unlockedCrops: ['tomato', 'corn', 'lettuce'],

    upgrades: [],

    achievements: [],

    stats: {
      totalEarnings: 0,
      cropsHarvested: 0,
      turnsPlayed: 0
    },

    // Turn state (reset each turn)
    turnState: {
      selectedDice: [],
      diceResults: [],
      cropsToPlace: 0,
      cropTypeToPlace: null,
      waterPool: 0,
      waterUsed: 0
    }
  };
}

function createEmptyPlot() {
  const spaces = [];
  for (let i = 0; i < 9; i++) {
    spaces.push({
      crop: null,
      waterLevel: 0,
      ready: false
    });
  }
  return spaces;
}

// Game State (global)
let gameState = createInitialGameState();

// Phase Management
function setPhase(phase) {
  gameState.phase = phase;
  updatePhaseDisplay();

  switch (phase) {
    case PHASES.MARKET:
      startMarketPhase();
      break;
    case PHASES.PLANNING:
      startPlanningPhase();
      break;
    case PHASES.PLANTING:
      startPlantingPhase();
      break;
    case PHASES.WATERING:
      startWateringPhase();
      break;
    case PHASES.HARVEST:
      startHarvestPhase();
      break;
    case PHASES.SHOP:
      startShopPhase();
      break;
  }
}

// Market Phase
function startMarketPhase() {
  updateMarketPrices();
  renderMarketPrices();
  setPhaseInstructions('Watch the market prices change!');

  showButton('btn-continue');
  hideButton('btn-roll');
  hideButton('btn-auto-fill');
  hideButton('btn-confirm-water');
  hideButton('btn-shop');
  hideButton('btn-end-turn');
}

function updateMarketPrices() {
  const priceChanges = {};

  for (let crop in gameState.marketPrices) {
    const roll = Math.random();
    let change = 1;

    if (roll >= 0.4) {
      if (roll < 0.7) {
        change = 1.1 + Math.random() * 0.1; // +10-20%
      } else {
        change = 0.9 - Math.random() * 0.1; // -10-20%
      }
    }

    const basePrice = gameState.basePrices[crop];
    const oldPrice = gameState.marketPrices[crop];
    let newPrice = oldPrice * change;

    // Clamp to 50%-200% of base
    newPrice = Math.max(basePrice * 0.5, Math.min(basePrice * 2.0, newPrice));
    newPrice = Math.round(newPrice * 100) / 100;

    gameState.marketPrices[crop] = newPrice;
    priceChanges[crop] = newPrice - oldPrice;
  }

  return priceChanges;
}

// Planning Phase
function startPlanningPhase() {
  gameState.turnState.selectedDice = [];
  gameState.turnState.diceResults = [];

  renderCropDice();
  clearDiceResults();

  setPhaseInstructions('Select crop dice to roll, then click "Roll Selected Dice"');

  showButton('btn-roll');
  hideButton('btn-continue');
  hideButton('btn-auto-fill');
  hideButton('btn-confirm-water');
  hideButton('btn-shop');
  hideButton('btn-end-turn');

  document.getElementById('btn-roll').disabled = true;
}

function toggleDieSelection(index) {
  if (gameState.phase !== PHASES.PLANNING) return;

  const selectedIndex = gameState.turnState.selectedDice.indexOf(index);

  if (selectedIndex === -1) {
    gameState.turnState.selectedDice.push(index);
  } else {
    gameState.turnState.selectedDice.splice(selectedIndex, 1);
  }

  renderCropDice();

  // Enable roll button if at least one die selected
  document.getElementById('btn-roll').disabled = gameState.turnState.selectedDice.length === 0;
}

// Planting Phase
function startPlantingPhase() {
  setPhaseInstructions('Click empty garden spaces to plant your crops, or use Auto-Fill');

  showButton('btn-auto-fill');
  showButton('btn-done-planting');
  hideButton('btn-roll');
  hideButton('btn-continue');
  hideButton('btn-confirm-water');

  updatePlacementCounter();
}

function confirmPlanting() {
  // Handle any remaining unplaced crops
  const remaining = gameState.turnState.cropsToPlace;

  if (remaining > 0 && gameState.upgrades.includes('compostBin')) {
    gameState.money += remaining;
    showToast(`Composted ${remaining} crops for $${remaining}!`, 'success');
  } else if (remaining > 0) {
    showToast(`${remaining} crops discarded (no space)`, 'info');
  }

  gameState.turnState.cropsToPlace = 0;
  setPhase(PHASES.WATERING);
}

function rollSelectedDice() {
  if (gameState.turnState.selectedDice.length === 0) return;

  const results = [];

  gameState.turnState.selectedDice.forEach(index => {
    const cropType = gameState.inventory.cropDice[index];
    let value = Math.floor(Math.random() * 6) + 1;

    // Apply fertilizer bonus
    if (gameState.upgrades.includes('fertilizer')) {
      value = Math.min(6, value + 1);
    }

    results.push({
      cropType,
      value,
      remaining: value
    });
  });

  gameState.turnState.diceResults = results;

  // Calculate total crops to place
  const totalCrops = results.reduce((sum, r) => sum + r.value, 0);
  gameState.turnState.cropsToPlace = totalCrops;

  animateDiceRoll(results, () => {
    setPhase(PHASES.PLANTING);
  });
}

function placeCrop(plotId, spaceIndex) {
  if (gameState.phase !== PHASES.PLANTING) return;

  const plot = gameState.gardenPlots.find(p => p.id === plotId);
  if (!plot) return;

  const space = plot.spaces[spaceIndex];
  if (space.crop) return; // Already has crop

  // Find a die result with remaining crops
  const availableResult = gameState.turnState.diceResults.find(r => r.remaining > 0);
  if (!availableResult) return;

  // Place the crop
  space.crop = availableResult.cropType;
  space.waterLevel = 0;
  space.ready = false;

  availableResult.remaining--;
  gameState.turnState.cropsToPlace--;

  renderGarden();
  updatePlacementCounter();
  updateDiceResultsDisplay();

  // Check if all crops placed
  if (gameState.turnState.cropsToPlace === 0) {
    setTimeout(() => {
      setPhase(PHASES.WATERING);
    }, 500);
  }
}

function autoFillCrops() {
  const emptySpaces = [];

  // Gather all empty spaces
  gameState.gardenPlots.forEach(plot => {
    plot.spaces.forEach((space, index) => {
      if (!space.crop) {
        emptySpaces.push({ plotId: plot.id, spaceIndex: index });
      }
    });
  });

  // Place crops in empty spaces
  for (const { plotId, spaceIndex } of emptySpaces) {
    const availableResult = gameState.turnState.diceResults.find(r => r.remaining > 0);
    if (!availableResult) break;

    const plot = gameState.gardenPlots.find(p => p.id === plotId);
    const space = plot.spaces[spaceIndex];

    space.crop = availableResult.cropType;
    space.waterLevel = 0;
    space.ready = false;

    availableResult.remaining--;
    gameState.turnState.cropsToPlace--;
  }

  // Handle discarded crops (compost bin upgrade)
  if (gameState.turnState.cropsToPlace > 0 && gameState.upgrades.includes('compostBin')) {
    const discarded = gameState.turnState.cropsToPlace;
    gameState.money += discarded;
    showToast(`Composted ${discarded} crops for $${discarded}!`, 'success');
    gameState.turnState.cropsToPlace = 0;
  }

  renderGarden();
  updatePlacementCounter();
  updateDiceResultsDisplay();

  setTimeout(() => {
    setPhase(PHASES.WATERING);
  }, 500);
}

function updatePlacementCounter() {
  const counter = document.getElementById('placement-counter');
  if (gameState.turnState.cropsToPlace > 0) {
    counter.textContent = `Crops to place: ${gameState.turnState.cropsToPlace}`;
  } else {
    counter.textContent = '';
  }
}

// Watering Phase
function startWateringPhase() {
  // Roll water dice
  let waterTotal = 0;
  const waterDiceCount = gameState.inventory.waterDice;

  for (let i = 0; i < waterDiceCount; i++) {
    let roll = Math.floor(Math.random() * 6) + 1;

    // Apply irrigation upgrade
    if (gameState.upgrades.includes('irrigation')) {
      roll = Math.max(3, roll);
    }

    waterTotal += roll;
  }

  gameState.turnState.waterPool = waterTotal;
  gameState.turnState.waterUsed = 0;

  setPhaseInstructions(`You have ${waterTotal} water 💧 Click crops to water them!`);

  showButton('btn-confirm-water');
  hideButton('btn-roll');
  hideButton('btn-auto-fill');
  hideButton('btn-done-planting');
  hideButton('btn-continue');

  updateWaterCounter();
  renderGarden();
}

function waterCrop(plotId, spaceIndex) {
  if (gameState.phase !== PHASES.WATERING) return;

  const plot = gameState.gardenPlots.find(p => p.id === plotId);
  if (!plot) return;

  const space = plot.spaces[spaceIndex];
  if (!space.crop) return;
  if (space.ready) return; // Already ready

  const waterRemaining = gameState.turnState.waterPool - gameState.turnState.waterUsed;
  if (waterRemaining <= 0) return;

  const cropData = CROPS[space.crop];
  const waterNeeded = cropData.waterNeeded - space.waterLevel;

  if (waterNeeded <= 0) return;

  // Add 1 water
  space.waterLevel++;
  gameState.turnState.waterUsed++;

  // Check if ready
  if (space.waterLevel >= cropData.waterNeeded) {
    space.ready = true;
  }

  renderGarden();
  updateWaterCounter();
}

function updateWaterCounter() {
  const remaining = gameState.turnState.waterPool - gameState.turnState.waterUsed;
  setPhaseInstructions(`Water remaining: ${remaining} 💧`);
}

function confirmWatering() {
  // Check for "Well Watered" achievement
  if (gameState.turnState.waterUsed === gameState.turnState.waterPool && gameState.turnState.waterPool > 0) {
    checkAchievement('wellWatered');
  }

  setPhase(PHASES.HARVEST);
}

// Harvest Phase
function startHarvestPhase() {
  setPhaseInstructions('Harvesting ready crops...');

  hideButton('btn-confirm-water');
  hideButton('btn-roll');
  hideButton('btn-auto-fill');

  // Collect ready crops
  const harvested = {};
  let totalEarnings = 0;

  gameState.gardenPlots.forEach(plot => {
    plot.spaces.forEach((space, index) => {
      if (space.ready && space.crop) {
        const cropType = space.crop;
        const price = gameState.marketPrices[cropType];

        if (!harvested[cropType]) {
          harvested[cropType] = { count: 0, earnings: 0 };
        }

        harvested[cropType].count++;
        harvested[cropType].earnings += price;
        totalEarnings += price;

        // Clear the space
        space.crop = null;
        space.waterLevel = 0;
        space.ready = false;

        gameState.stats.cropsHarvested++;
      }
    });
  });

  // Update money
  gameState.money += totalEarnings;
  gameState.money = Math.round(gameState.money * 100) / 100;
  gameState.stats.totalEarnings += totalEarnings;

  // Show harvest results
  if (Object.keys(harvested).length > 0) {
    let message = 'Harvested: ';
    const parts = [];

    for (const [cropType, data] of Object.entries(harvested)) {
      parts.push(`${data.count} ${CROPS[cropType].emoji} ($${data.earnings.toFixed(2)})`);
    }

    message += parts.join(', ');
    showToast(message, 'money');

    // XP for harvesting
    gainXP(Object.values(harvested).reduce((sum, h) => sum + h.count, 0));

    // Check achievements
    checkAchievement('firstHarvest');
    checkAchievement('greenThumb');

    // Check market timing achievement
    for (const [cropType, data] of Object.entries(harvested)) {
      const basePrice = gameState.basePrices[cropType];
      const currentPrice = gameState.marketPrices[cropType];
      if (currentPrice >= basePrice * 1.5) {
        checkAchievement('marketTiming');
      }
    }
  } else {
    showToast('No crops ready to harvest', 'info');
  }

  renderGarden();
  updateMoneyDisplay();

  // Auto-advance to shop
  setTimeout(() => {
    setPhase(PHASES.SHOP);
  }, 1500);
}

// Shop Phase
function startShopPhase() {
  // Gain XP for completing turn
  gainXP(5);
  gameState.stats.turnsPlayed++;

  setPhaseInstructions('Visit the shop or end your turn');

  showButton('btn-shop');
  showButton('btn-end-turn');
  hideButton('btn-roll');
  hideButton('btn-auto-fill');
  hideButton('btn-confirm-water');
  hideButton('btn-continue');

  // Auto-save
  saveGame();
}

function endTurn() {
  gameState.turn++;

  // Reset turn state
  gameState.turnState = {
    selectedDice: [],
    diceResults: [],
    cropsToPlace: 0,
    cropTypeToPlace: null,
    waterPool: 0,
    waterUsed: 0
  };

  updateTurnDisplay();
  clearDiceResults();

  setPhase(PHASES.MARKET);
}

// XP & Leveling
function gainXP(amount) {
  gameState.xp += amount;

  const xpNeeded = gameState.level * 50;

  while (gameState.xp >= xpNeeded) {
    gameState.xp -= xpNeeded;
    gameState.level++;
    showToast(`Level Up! You are now level ${gameState.level}`, 'success');

    // Check for crop unlocks
    for (const [cropType, cropData] of Object.entries(CROPS)) {
      if (cropData.unlockLevel === gameState.level && !gameState.unlockedCrops.includes(cropType)) {
        gameState.unlockedCrops.push(cropType);
        showToast(`Unlocked: ${cropData.emoji} ${cropData.name}!`, 'success');
      }
    }
  }

  updateXPDisplay();
}

// Garden Plot Purchase
function buyGardenPlot() {
  const cost = 25;

  if (gameState.money < cost) {
    showToast('Not enough money!', 'error');
    return false;
  }

  gameState.money -= cost;

  const newPlotId = gameState.gardenPlots.length;
  gameState.gardenPlots.push({
    id: newPlotId,
    spaces: createEmptyPlot()
  });

  updateMoneyDisplay();
  renderGarden();
  showToast('Purchased new garden plot!', 'success');

  // Check achievement
  checkAchievement('expansion');
  checkAchievement('farmingEmpire');

  return true;
}

// Helper Functions
function getEmptySpaceCount() {
  let count = 0;
  gameState.gardenPlots.forEach(plot => {
    plot.spaces.forEach(space => {
      if (!space.crop) count++;
    });
  });
  return count;
}

function getTotalSpaceCount() {
  return gameState.gardenPlots.length * 9;
}

function getFilledSpaceCount() {
  return getTotalSpaceCount() - getEmptySpaceCount();
}
