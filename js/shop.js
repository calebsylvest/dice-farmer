// Dice Farmer - Shop System

let currentShopTab = 'seeds';

function openShop() {
  const modal = document.getElementById('shop-modal');
  modal.style.display = 'flex';
  updateShopMoney();
  renderShopContent();
}

function closeShop() {
  const modal = document.getElementById('shop-modal');
  modal.style.display = 'none';
}

function switchShopTab(tab) {
  currentShopTab = tab;

  // Update tab buttons
  document.querySelectorAll('.shop-tab').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });

  renderShopContent();
}

function updateShopMoney() {
  document.getElementById('shop-money').textContent = `💰 $${gameState.money.toFixed(2)}`;
}

function renderShopContent() {
  const container = document.getElementById('shop-content');
  container.innerHTML = '';

  switch (currentShopTab) {
    case 'seeds':
      renderSeedsShop(container);
      break;
    case 'garden':
      renderGardenShop(container);
      break;
    case 'water':
      renderWaterShop(container);
      break;
    case 'upgrades':
      renderUpgradesShop(container);
      break;
  }
}

function renderSeedsShop(container) {
  const header = document.createElement('p');
  header.style.marginBottom = '15px';
  header.style.color = '#666';
  header.textContent = 'Purchase new crop dice to expand your planting options.';
  container.appendChild(header);

  for (const [cropType, cropData] of Object.entries(CROPS)) {
    // Only show unlocked crops
    if (!gameState.unlockedCrops.includes(cropType)) continue;

    const item = document.createElement('div');
    item.className = 'shop-item';

    const canAfford = gameState.money >= cropData.purchaseCost;

    item.innerHTML = `
      <div class="icon">${cropData.emoji}</div>
      <div class="info">
        <div class="name">${cropData.name} Die</div>
        <div class="description">Base price: $${cropData.basePrice} | Water: ${cropData.waterNeeded}💧</div>
      </div>
      <button class="btn btn-primary btn-buy" ${!canAfford ? 'disabled' : ''}>
        $${cropData.purchaseCost}
      </button>
    `;

    const buyBtn = item.querySelector('.btn-buy');
    buyBtn.addEventListener('click', () => {
      purchaseCropDie(cropType);
    });

    container.appendChild(item);
  }

  // Show locked crops
  for (const [cropType, cropData] of Object.entries(CROPS)) {
    if (gameState.unlockedCrops.includes(cropType)) continue;

    const item = document.createElement('div');
    item.className = 'shop-item';
    item.style.opacity = '0.5';

    item.innerHTML = `
      <div class="icon">${cropData.emoji}</div>
      <div class="info">
        <div class="name">${cropData.name} Die</div>
        <div class="description">🔒 Unlocks at Level ${cropData.unlockLevel}</div>
      </div>
      <button class="btn btn-secondary btn-buy" disabled>
        Locked
      </button>
    `;

    container.appendChild(item);
  }
}

function renderGardenShop(container) {
  const header = document.createElement('p');
  header.style.marginBottom = '15px';
  header.style.color = '#666';
  header.textContent = 'Expand your garden with new 3×3 plots.';
  container.appendChild(header);

  const currentPlots = gameState.gardenPlots.length;
  const plotCost = 25;
  const canAfford = gameState.money >= plotCost;

  const item = document.createElement('div');
  item.className = 'shop-item';

  item.innerHTML = `
    <div class="icon">🌱</div>
    <div class="info">
      <div class="name">Garden Plot</div>
      <div class="description">A new 3×3 plot for planting. Current: ${currentPlots} plots</div>
    </div>
    <button class="btn btn-primary btn-buy" ${!canAfford ? 'disabled' : ''}>
      $${plotCost}
    </button>
  `;

  const buyBtn = item.querySelector('.btn-buy');
  buyBtn.addEventListener('click', () => {
    if (buyGardenPlot()) {
      renderShopContent();
      updateShopMoney();
    }
  });

  container.appendChild(item);
}

function renderWaterShop(container) {
  const header = document.createElement('p');
  header.style.marginBottom = '15px';
  header.style.color = '#666';
  header.textContent = 'Purchase additional water dice to water more crops each turn.';
  container.appendChild(header);

  const currentWater = gameState.inventory.waterDice;
  const waterCost = 12;
  const canAfford = gameState.money >= waterCost;

  const item = document.createElement('div');
  item.className = 'shop-item';

  item.innerHTML = `
    <div class="icon">💧</div>
    <div class="info">
      <div class="name">Water Die</div>
      <div class="description">Adds 1-6 water per turn. Current: ${currentWater} dice</div>
    </div>
    <button class="btn btn-primary btn-buy" ${!canAfford ? 'disabled' : ''}>
      $${waterCost}
    </button>
  `;

  const buyBtn = item.querySelector('.btn-buy');
  buyBtn.addEventListener('click', () => {
    purchaseWaterDie();
  });

  container.appendChild(item);
}

function renderUpgradesShop(container) {
  const header = document.createElement('p');
  header.style.marginBottom = '15px';
  header.style.color = '#666';
  header.textContent = 'Permanent upgrades to improve your farm.';
  container.appendChild(header);

  for (const [upgradeId, upgradeData] of Object.entries(UPGRADES)) {
    const owned = gameState.upgrades.includes(upgradeId);
    const canAfford = gameState.money >= upgradeData.cost;

    const item = document.createElement('div');
    item.className = 'shop-item';

    if (owned) {
      item.style.background = '#E8F5E9';
    }

    item.innerHTML = `
      <div class="icon">${getUpgradeIcon(upgradeId)}</div>
      <div class="info">
        <div class="name">${upgradeData.name}</div>
        <div class="description">${upgradeData.description}</div>
      </div>
      <button class="btn ${owned ? 'btn-secondary owned' : 'btn-primary'} btn-buy"
              ${owned || !canAfford ? 'disabled' : ''}>
        ${owned ? '✓ Owned' : '$' + upgradeData.cost}
      </button>
    `;

    if (!owned) {
      const buyBtn = item.querySelector('.btn-buy');
      buyBtn.addEventListener('click', () => {
        purchaseUpgrade(upgradeId);
      });
    }

    container.appendChild(item);
  }
}

function getUpgradeIcon(upgradeId) {
  const icons = {
    irrigation: '🚿',
    compostBin: '♻️',
    fertilizer: '🧪'
  };
  return icons[upgradeId] || '⭐';
}

// Purchase Functions
function purchaseCropDie(cropType) {
  const cropData = CROPS[cropType];

  if (gameState.money < cropData.purchaseCost) {
    showToast('Not enough money!', 'error');
    return;
  }

  gameState.money -= cropData.purchaseCost;
  gameState.inventory.cropDice.push(cropType);

  updateMoneyDisplay();
  updateShopMoney();
  renderCropDice();
  renderShopContent();

  showToast(`Purchased ${cropData.emoji} ${cropData.name} die!`, 'success');

  // Check diversification achievement
  checkAchievement('diversification');
}

function purchaseWaterDie() {
  const cost = 12;

  if (gameState.money < cost) {
    showToast('Not enough money!', 'error');
    return;
  }

  gameState.money -= cost;
  gameState.inventory.waterDice++;

  updateMoneyDisplay();
  updateShopMoney();
  renderWaterDice();
  renderShopContent();

  showToast('Purchased water die!', 'success');
}

function purchaseUpgrade(upgradeId) {
  const upgradeData = UPGRADES[upgradeId];

  if (gameState.money < upgradeData.cost) {
    showToast('Not enough money!', 'error');
    return;
  }

  if (gameState.upgrades.includes(upgradeId)) {
    showToast('Already owned!', 'error');
    return;
  }

  gameState.money -= upgradeData.cost;
  gameState.upgrades.push(upgradeId);

  updateMoneyDisplay();
  updateShopMoney();
  renderShopContent();

  showToast(`Purchased ${upgradeData.name}!`, 'success');
}

// Initialize shop event listeners
function initShopListeners() {
  document.getElementById('btn-shop').addEventListener('click', openShop);
  document.getElementById('btn-close-shop').addEventListener('click', closeShop);

  document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchShopTab(tab.dataset.tab);
    });
  });

  // Close modal when clicking outside
  document.getElementById('shop-modal').addEventListener('click', (e) => {
    if (e.target.id === 'shop-modal') {
      closeShop();
    }
  });
}
