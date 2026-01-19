// Dice Farmer - UI Rendering

// Update Header Displays
function updateTurnDisplay() {
  document.getElementById('turn-display').textContent = `Turn ${gameState.turn}`;
}

function updateMoneyDisplay() {
  const moneyEl = document.getElementById('money-display');
  moneyEl.textContent = `💰 $${gameState.money.toFixed(2)}`;

  // Also update shop money if open
  const shopMoney = document.getElementById('shop-money');
  if (shopMoney) {
    shopMoney.textContent = `💰 $${gameState.money.toFixed(2)}`;
  }
}

function updateLevelDisplay() {
  document.getElementById('level-display').textContent = `Level ${gameState.level}`;
}

function updateXPDisplay() {
  const xpNeeded = gameState.level * 50;
  document.getElementById('xp-display').textContent = `XP: ${gameState.xp}/${xpNeeded}`;
}

function updatePhaseDisplay() {
  const phaseNames = {
    [PHASES.MARKET]: 'Market Phase',
    [PHASES.PLANNING]: 'Planning Phase',
    [PHASES.PLANTING]: 'Planting Phase',
    [PHASES.WATERING]: 'Watering Phase',
    [PHASES.HARVEST]: 'Harvest Phase',
    [PHASES.SHOP]: 'Shop Phase'
  };

  document.getElementById('phase-display').textContent = phaseNames[gameState.phase] || '';
}

function setPhaseInstructions(text) {
  document.getElementById('phase-instructions').textContent = text;
}

// Market Prices Rendering
function renderMarketPrices() {
  const container = document.getElementById('market-prices');
  container.innerHTML = '';

  for (const [cropType, price] of Object.entries(gameState.marketPrices)) {
    if (!gameState.unlockedCrops.includes(cropType)) continue;

    const cropData = CROPS[cropType];
    const basePrice = gameState.basePrices[cropType];
    const percentChange = ((price - basePrice) / basePrice) * 100;

    const item = document.createElement('div');
    item.className = 'market-item';

    if (percentChange > 5) {
      item.classList.add('price-up');
    } else if (percentChange < -5) {
      item.classList.add('price-down');
    }

    let changeIcon = '';
    let changeClass = '';
    if (percentChange > 5) {
      changeIcon = '↑';
      changeClass = 'up';
    } else if (percentChange < -5) {
      changeIcon = '↓';
      changeClass = 'down';
    }

    item.innerHTML = `
      <span class="emoji">${cropData.emoji}</span>
      <span class="price">$${price.toFixed(2)}</span>
      ${changeIcon ? `<span class="change ${changeClass}">${changeIcon}</span>` : ''}
    `;

    container.appendChild(item);
  }
}

// Garden Rendering
function renderGarden() {
  const container = document.getElementById('garden-plots');
  container.innerHTML = '';

  // Render existing plots
  gameState.gardenPlots.forEach(plot => {
    const plotEl = document.createElement('div');
    plotEl.className = 'garden-plot';

    const gridEl = document.createElement('div');
    gridEl.className = 'plot-grid';

    plot.spaces.forEach((space, index) => {
      const spaceEl = document.createElement('div');
      spaceEl.className = 'garden-space';

      if (space.crop) {
        spaceEl.classList.add('has-crop');
        const cropData = CROPS[space.crop];
        spaceEl.textContent = cropData.emoji;

        // Water indicator
        if (space.waterLevel > 0 && !space.ready) {
          const waterIndicator = document.createElement('div');
          waterIndicator.className = 'water-indicator';
          for (let i = 0; i < space.waterLevel; i++) {
            waterIndicator.innerHTML += '💧';
          }
          spaceEl.appendChild(waterIndicator);
        }

        if (space.ready) {
          spaceEl.classList.add('ready');
        }
      }

      // Click handlers based on phase
      spaceEl.addEventListener('click', () => {
        if (gameState.phase === PHASES.PLANTING && !space.crop) {
          placeCrop(plot.id, index);
        } else if (gameState.phase === PHASES.WATERING && space.crop && !space.ready) {
          waterCrop(plot.id, index);
        }
      });

      // Hover preview for planting
      spaceEl.addEventListener('mouseenter', () => {
        if (gameState.phase === PHASES.PLANTING && !space.crop && gameState.turnState.cropsToPlace > 0) {
          spaceEl.classList.add('preview');
          const availableResult = gameState.turnState.diceResults.find(r => r.remaining > 0);
          if (availableResult) {
            spaceEl.textContent = CROPS[availableResult.cropType].emoji;
            spaceEl.style.opacity = '0.6';
          }
        }
      });

      spaceEl.addEventListener('mouseleave', () => {
        if (gameState.phase === PHASES.PLANTING && !space.crop) {
          spaceEl.classList.remove('preview');
          spaceEl.textContent = '';
          spaceEl.style.opacity = '1';
        }
      });

      gridEl.appendChild(spaceEl);
    });

    plotEl.appendChild(gridEl);

    const label = document.createElement('div');
    label.className = 'plot-label';
    label.textContent = `Plot ${plot.id + 1}`;
    plotEl.appendChild(label);

    container.appendChild(plotEl);
  });

  // Add "Buy Plot" card
  const buyCard = document.createElement('div');
  buyCard.className = 'buy-plot-card';
  buyCard.innerHTML = `
    <div class="icon">🌱</div>
    <div class="text">Buy New Plot</div>
    <div class="price">$25</div>
  `;
  buyCard.addEventListener('click', () => {
    buyGardenPlot();
  });
  container.appendChild(buyCard);
}

// Crop Dice Rendering
function renderCropDice() {
  const container = document.getElementById('crop-dice-list');
  container.innerHTML = '';

  gameState.inventory.cropDice.forEach((cropType, index) => {
    const cropData = CROPS[cropType];

    const dieBtn = document.createElement('button');
    dieBtn.className = 'die-button';

    if (gameState.turnState.selectedDice.includes(index)) {
      dieBtn.classList.add('selected');
    }

    dieBtn.textContent = cropData.emoji;
    dieBtn.title = cropData.name;

    dieBtn.addEventListener('click', () => {
      toggleDieSelection(index);
    });

    container.appendChild(dieBtn);
  });
}

// Water Dice Rendering
function renderWaterDice() {
  const container = document.getElementById('water-dice-list');
  container.innerHTML = '';

  for (let i = 0; i < gameState.inventory.waterDice; i++) {
    const dieBtn = document.createElement('button');
    dieBtn.className = 'die-button water';
    dieBtn.textContent = '💧';
    dieBtn.title = 'Water Die';
    container.appendChild(dieBtn);
  }
}

// Dice Results Display
function updateDiceResultsDisplay() {
  const container = document.getElementById('roll-results-display');
  container.innerHTML = '';

  gameState.turnState.diceResults.forEach(result => {
    const cropData = CROPS[result.cropType];

    const resultEl = document.createElement('div');
    resultEl.className = 'die-result';

    resultEl.innerHTML = `
      <div class="die-face">
        <span class="crop-icon">${cropData.emoji}</span>
        ${result.value}
      </div>
      <div class="die-result-label">${result.remaining} left</div>
    `;

    container.appendChild(resultEl);
  });
}

function clearDiceResults() {
  document.getElementById('roll-results-display').innerHTML = '';
  document.getElementById('placement-counter').textContent = '';
}

// Button Visibility Helpers
function showButton(id) {
  const btn = document.getElementById(id);
  if (btn) btn.style.display = 'inline-block';
}

function hideButton(id) {
  const btn = document.getElementById(id);
  if (btn) btn.style.display = 'none';
}

// Toast Messages
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Achievement Popup
function showAchievementPopup(achievement) {
  const popup = document.getElementById('achievement-popup');
  document.getElementById('achievement-title').textContent = achievement.name;
  document.getElementById('achievement-description').textContent = achievement.description;

  popup.style.display = 'block';

  setTimeout(() => {
    popup.style.display = 'none';
  }, 4000);
}

// Update All Displays
function updateAllDisplays() {
  updateTurnDisplay();
  updateMoneyDisplay();
  updateLevelDisplay();
  updateXPDisplay();
  updatePhaseDisplay();
  renderMarketPrices();
  renderGarden();
  renderCropDice();
  renderWaterDice();
}
