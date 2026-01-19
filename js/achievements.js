// Dice Farmer - Achievements System

const ACHIEVEMENTS = {
  firstHarvest: {
    name: 'First Harvest',
    description: 'Harvest your first crop',
    check: () => gameState.stats.cropsHarvested >= 1
  },
  expansion: {
    name: 'Expansion',
    description: 'Buy your second garden plot',
    check: () => gameState.gardenPlots.length >= 2
  },
  diversification: {
    name: 'Diversification',
    description: 'Own 4 different crop types',
    check: () => new Set(gameState.inventory.cropDice).size >= 4
  },
  wellWatered: {
    name: 'Well Watered',
    description: 'Use all water in a single turn',
    check: () => true // Checked manually when condition is met
  },
  greenThumb: {
    name: 'Green Thumb',
    description: 'Harvest 50 total crops',
    check: () => gameState.stats.cropsHarvested >= 50
  },
  marketTiming: {
    name: 'Market Timing',
    description: 'Sell crops at 150%+ market price',
    check: () => true // Checked manually when condition is met
  }
};

function checkAchievement(achievementId) {
  // Already unlocked
  if (gameState.achievements.includes(achievementId)) {
    return false;
  }

  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return false;

  // Check condition
  if (achievement.check()) {
    unlockAchievement(achievementId);
    return true;
  }

  return false;
}

function unlockAchievement(achievementId) {
  if (gameState.achievements.includes(achievementId)) {
    return;
  }

  gameState.achievements.push(achievementId);

  const achievement = ACHIEVEMENTS[achievementId];
  showAchievementPopup(achievement);

  // Save after achievement
  saveGame();
}

function checkAllAchievements() {
  for (const achievementId of Object.keys(ACHIEVEMENTS)) {
    checkAchievement(achievementId);
  }
}
