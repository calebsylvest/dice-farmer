# Dice Farmer - Complete Game Implementation Prompt

You are building **Dice Farmer**, a single-player dice-rolling farm management web game. This prompt contains everything you need to build the complete game in one shot.

## Project Overview

Create a fully playable browser-based game where players roll dice to plant crops, manage water resources, harvest for profit, and expand their garden. The game should be visually appealing, satisfying to play, and progressively unlock new content.

## Technical Stack

- **HTML5** with Canvas for dice rendering
- **Vanilla JavaScript** (or React if you prefer component architecture)
- **CSS3** for styling (use CSS Grid for garden layout)
- **Matter.js** or **Cannon.js** for 3D dice physics
- **LocalStorage** for save/load functionality
- **No external dependencies** beyond physics library (keep it simple)

## Core Game Loop - 6 Phases Per Turn

### Phase 1: Market Phase (Automated)
- Display current market prices for all crops
- Animate price changes (±10-20% randomly)
- Each crop has 40% no change, 30% increase, 30% decrease
- Prices cannot go below 50% or above 200% of base value
- Auto-advance after 2 seconds OR provide "Continue" button

### Phase 2: Planning Phase (Player Input)
- Display all owned crop dice as selectable buttons/checkboxes
- Player selects which dice to roll (minimum 1)
- Show current garden capacity (X/Y spaces filled)
- Show current money and water dice count
- "Roll Selected Dice" button to proceed

### Phase 3: Planting Phase (Interactive)
- **Dice Roll:** Animate 3D dice rolling for selected crop dice
- **Display Results:** Show pip values clearly for each die
- **Placement:** Player clicks empty garden spaces to place crops
  - Each pip = 1 crop to place
  - Visual preview on hover
  - Counter showing "X crops remaining to place"
  - Warn if not enough space (overflow = discarded)
- **Buttons:** "Auto-Fill" (automatic placement), "Undo" (reset placement)
- Proceed when all crops placed or player confirms

### Phase 4: Watering Phase (Interactive)
- **Water Roll:** Roll all water dice, display total water pool
- **Distribution:** Player clicks crop groups to add +1 water each click
  - Visual indicator shows water level (empty → partial → full)
  - Standard crops need 2 water to become "ready"
  - Carrots need 1, Eggplants need 3
  - Groups glow GREEN when ready to harvest
- **Counter:** "X water remaining"
- **Button:** "Confirm Watering" to proceed

### Phase 5: Harvest Phase (Automated)
- Identify all crops marked as "ready" (have enough water)
- Play collection animation for each ready crop
- Calculate earnings: count × current market price
- Display summary: "Harvested X tomatoes for $Y"
- Update money with counting animation
- Remove harvested crops from garden
- Auto-advance after animation

### Phase 6: Shop Phase (Interactive)
- **Shop Interface** with tabs:
  - **Seeds:** Purchase new crop dice
  - **Garden:** Purchase new 3×3 plots ($25 each)
  - **Water:** Purchase water dice ($12 each)
  - **Upgrades:** Purchase special abilities
- Display current money prominently
- Click items to purchase (with confirmation)
- "End Turn" button to start next turn
- "Skip Shop" option

## Game State Data Structure

```javascript
const gameState = {
  turn: 1,
  money: 15, // Starting money
  xp: 0,
  level: 1,
  
  gardenPlots: [
    {
      id: 0,
      spaces: [ // 9 spaces per plot
        { crop: null, waterLevel: 0, ready: false },
        // ... 8 more
      ]
    }
  ],
  
  inventory: {
    cropDice: ['tomato', 'corn', 'lettuce'], // Starting dice
    waterDice: 2 // Starting water dice count
  },
  
  marketPrices: {
    tomato: 2,
    corn: 3,
    lettuce: 2,
    carrot: 4,
    pepper: 5,
    eggplant: 6,
    pumpkin: 10
  },
  
  basePrices: { /* same as marketPrices initially */ },
  
  unlockedCrops: ['tomato', 'corn', 'lettuce'], // Level-based unlocks
  
  upgrades: [], // Purchased upgrades
  
  achievements: [],
  
  stats: {
    totalEarnings: 0,
    cropsHarvested: 0,
    turnsPlayed: 0
  }
};
```

## Crop Definitions

```javascript
const CROPS = {
  tomato: {
    name: 'Tomato',
    emoji: '🍅',
    color: '#FF6347',
    basePrice: 2,
    waterNeeded: 2,
    unlockLevel: 1,
    purchaseCost: 10,
    spaces: 1
  },
  corn: {
    name: 'Corn',
    emoji: '🌽',
    color: '#FFD700',
    basePrice: 3,
    waterNeeded: 2,
    unlockLevel: 1,
    purchaseCost: 10,
    spaces: 1
  },
  lettuce: {
    name: 'Lettuce',
    emoji: '🥬',
    color: '#90EE90',
    basePrice: 2,
    waterNeeded: 2,
    unlockLevel: 1,
    purchaseCost: 10,
    spaces: 1
  },
  carrot: {
    name: 'Carrot',
    emoji: '🥕',
    color: '#FF8C00',
    basePrice: 4,
    waterNeeded: 1, // Special: only needs 1 water
    unlockLevel: 2,
    purchaseCost: 12,
    spaces: 1
  },
  pepper: {
    name: 'Pepper',
    emoji: '🌶️',
    color: '#DC143C',
    basePrice: 5,
    waterNeeded: 2,
    unlockLevel: 5,
    purchaseCost: 18,
    spaces: 1,
    special: 'clusterBonus' // Bonus if 4+ together
  },
  eggplant: {
    name: 'Eggplant',
    emoji: '🍆',
    color: '#8B008B',
    basePrice: 6,
    waterNeeded: 3, // Needs more water
    unlockLevel: 8,
    purchaseCost: 20,
    spaces: 1
  },
  pumpkin: {
    name: 'Pumpkin',
    emoji: '🎃',
    color: '#FF7518',
    basePrice: 10,
    waterNeeded: 2,
    unlockLevel: 10,
    purchaseCost: 25,
    spaces: 4 // Takes 4 spaces!
  }
};
```

## UI Layout

```
┌────────────────────────────────────────────────────┐
│ HEADER: Turn 5 | Money: $127 | Level 3 | XP: 45/60 │
├────────────────────────────────────────────────────┤
│ MARKET PRICES (with up/down arrows for changes)   │
│ 🍅 $2.40 ↑ | 🌽 $3.80 ↑ | 🥬 $1.80 ↓ | ...        │
├────────────────────────────────────────────────────┤
│                                                    │
│ GARDEN AREA (scrollable if many plots)            │
│                                                    │
│  ┌─────┬─────┬─────┐  ┌─────┬─────┬─────┐         │
│  │ 🍅  │ 🍅  │     │  │ 🌽  │ 🌽  │ 🌽  │         │
│  ├─────┼─────┼─────┤  ├─────┼─────┼─────┤         │
│  │ 🍅  │     │     │  │ 🥬  │ 🥬  │     │         │
│  ├─────┼─────┼─────┤  ├─────┼─────┼─────┤         │
│  │     │     │     │  │     │     │     │         │
│  └─────┴─────┴─────┘  └─────┴─────┴─────┘         │
│        Plot 1                Plot 2                │
│                                                    │
│  ┌─────┬─────┬─────┐  ┌─────────────┐             │
│  │     │     │     │  │  Buy New    │             │
│  ├─────┼─────┼─────┤  │   Plot      │             │
│  │     │     │     │  │   $25       │             │
│  ├─────┼─────┼─────┤  └─────────────┘             │
│  │     │     │     │                               │
│  └─────┴─────┴─────┘                               │
│        Plot 3                                      │
│                                                    │
├────────────────────────────────────────────────────┤
│ DICE AREA & CONTROLS                              │
│                                                    │
│ Your Crop Dice: [🍅] [🍅] [🌽] [🥬] [🥕]          │
│ Water Dice: 💧 💧                                  │
│                                                    │
│ Phase: PLANTING  |  Crops to place: 7             │
│                                                    │
│ [Roll Dice] [Auto-Fill] [Shop] [End Turn]        │
└────────────────────────────────────────────────────┘
```

## Visual Design Requirements

### Color Palette
- **Background:** Soft cream/beige (#F5F5DC)
- **Garden plots:** Rich brown (#8B4513) with dark borders
- **UI elements:** Earthy greens and browns
- **Accent:** Gold for money (#FFD700)
- **Water:** Sky blue (#87CEEB)

### Typography
- **Header/Money:** Bold, large (24-32px)
- **Body text:** Clean sans-serif (16-18px)
- **Buttons:** 18px, rounded corners, hover states

### Animations
1. **Dice Roll:** 1-2 second physics-based tumble
2. **Crop Placement:** 300ms fade-in with small bounce
3. **Watering:** Blue particles/droplets animation
4. **Harvest:** Crops zoom to money counter with sparkles
5. **Money Gain:** Counting animation with "+$X" popup
6. **Purchase:** Brief flash/glow effect

### Icons & Emojis
- Use crop emojis for visual clarity
- Water droplet emoji 💧 for water
- Money bag 💰 or coins for currency
- Sparkles ✨ for ready crops

## Progression System

### XP & Leveling
- **XP Gain:** 1 XP per crop harvested, 5 XP per turn completed
- **Level Thresholds:** Level N requires N × 50 XP
- **Unlocks by Level:**
  - Level 1: Start (Tomato, Corn, Lettuce)
  - Level 2: Carrots unlocked
  - Level 5: Peppers unlocked
  - Level 8: Eggplant unlocked
  - Level 10: Pumpkins unlocked

### Upgrades (Shop Tab)

```javascript
const UPGRADES = {
  greenhouse: {
    name: 'Greenhouse',
    cost: 50,
    description: 'Once per turn, reroll one crop die',
    effect: 'reroll'
  },
  irrigation: {
    name: 'Irrigation System',
    cost: 60,
    description: 'Water dice minimum value = 3',
    effect: 'waterMinimum3'
  },
  fertilizer: {
    name: 'Fertilizer',
    cost: 30,
    description: 'Single use: One crop die rolls twice, keep best',
    effect: 'advantage',
    consumable: true
  },
  compostBin: {
    name: 'Compost Bin',
    cost: 40,
    description: 'Gain $1 per discarded crop',
    effect: 'discardValue'
  },
  seedVault: {
    name: 'Seed Vault',
    cost: 75,
    description: 'Store one die result for next turn',
    effect: 'storage'
  },
  marketInsight: {
    name: 'Market Insight',
    cost: 35,
    description: 'Preview next turn\'s price changes',
    effect: 'pricePreview'
  }
};
```

## Save/Load System

### Auto-Save
- Save gameState to localStorage after each turn completion
- Save key: `'veggieDice_saveData'`
- Include timestamp for save date display

### Load on Start
- Check for existing save on page load
- Display "Continue Game" or "New Game" options
- "Delete Save" option in settings

### Save Data Format
```javascript
{
  version: '1.0',
  timestamp: Date.now(),
  gameState: { /* full gameState object */ }
}
```

## Tutorial System (First-Time Experience)

### Turn 1 Tutorial
Display modal/overlay with instructions:
1. "Welcome to Veggie Dice! Watch the market prices change."
2. "Select your Tomato die to plant some tomatoes."
3. "Roll the die to see how many you get!"
4. "Click empty garden spaces to plant your tomatoes."
5. "Now roll your water dice."
6. "Click on your tomatoes to water them. They need 2 water to grow!"
7. "Great! Your crops are ready. Watch them get harvested."
8. "You earned money! Visit the shop to buy more dice or expand."

### Skip Tutorial
- Checkbox: "Don't show tutorial again" (save to localStorage)
- "Skip Tutorial" button visible throughout

## Achievements System

Implement at least these 8 achievements:

```javascript
const ACHIEVEMENTS = {
  firstHarvest: {
    name: 'First Harvest',
    description: 'Harvest your first crop',
    check: (stats) => stats.cropsHarvested >= 1
  },
  expansion: {
    name: 'Expansion',
    description: 'Buy your second garden plot',
    check: (state) => state.gardenPlots.length >= 2
  },
  diversification: {
    name: 'Diversification',
    description: 'Own 4 different crop types',
    check: (state) => new Set(state.inventory.cropDice).size >= 4
  },
  wellWatered: {
    name: 'Well Watered',
    description: 'Use all water in a single turn',
    check: (waterUsed, waterTotal) => waterUsed === waterTotal
  },
  greenThumb: {
    name: 'Green Thumb',
    description: 'Harvest 50 total crops',
    check: (stats) => stats.cropsHarvested >= 50
  },
  fullGarden: {
    name: 'Full Garden',
    description: 'Fill all spaces in 3 plots',
    check: (state) => /* check if 3 plots are full */
  },
  marketTiming: {
    name: 'Market Timing',
    description: 'Sell crops at 150%+ market price',
    check: (price, basePrice) => price >= basePrice * 1.5
  },
  farmingEmpire: {
    name: 'Farming Empire',
    description: 'Own 8+ garden plots',
    check: (state) => state.gardenPlots.length >= 8
  }
};
```

Display achievement popup when unlocked with celebratory animation.

## Game Mechanics - Special Rules

### Pepper Cluster Bonus
- If 4 or more peppers are adjacent (touching horizontally/vertically)
- They sell for 2× price
- Visual indicator during harvest phase

### Pumpkin Placement
- Pumpkins require 4 contiguous spaces (2×2)
- During placement, show 2×2 preview
- Cannot place if insufficient space
- Counts as 1 crop but occupies 4 spaces

### Market Price Volatility
```javascript
function updateMarketPrices() {
  for (let crop in marketPrices) {
    const roll = Math.random();
    if (roll < 0.4) continue; // No change
    
    const change = roll < 0.7 
      ? 1.1 + Math.random() * 0.1  // +10-20%
      : 0.9 - Math.random() * 0.1; // -10-20%
    
    marketPrices[crop] = Math.max(
      basePrices[crop] * 0.5,
      Math.min(
        basePrices[crop] * 2.0,
        marketPrices[crop] * change
      )
    );
  }
}
```

## Dice Physics Implementation

### Use Matter.js for 3D-looking 2D dice

```javascript
// Pseudo-code for dice rolling
function rollDice(dieType, value) {
  // Create physics body
  const die = Bodies.rectangle(x, y, 60, 60, {
    restitution: 0.5,
    friction: 0.1,
    render: {
      sprite: {
        texture: `/images/dice/${dieType}.png`
      }
    }
  });
  
  // Add random impulse
  Body.applyForce(die, die.position, {
    x: (Math.random() - 0.5) * 0.05,
    y: -0.05
  });
  
  // Settle after 2 seconds, show result
  setTimeout(() => {
    displayDieResult(dieType, value);
  }, 2000);
}
```

**Alternative (simpler):** CSS animations for dice roll, no physics library
- Keyframe animation with rotation
- Final result is predetermined (actual die value)
- Still looks satisfying, much simpler

## Audio Requirements (Optional but Recommended)

### Sound Effects
- **Dice roll:** Soft tumbling sound
- **Plant crop:** Light "pop" or soil sound
- **Water splash:** Gentle sprinkle
- **Harvest:** Pleasant "pluck" or collection sound
- **Money gain:** Cash register "cha-ching"
- **Button click:** Soft tap
- **Purchase:** Confirmation chime
- **Achievement:** Short fanfare

### Implementation
- Use HTML5 Audio API or Howler.js
- Volume control in settings
- Mute button easily accessible
- All audio optional/toggleable

## Responsive Design

### Desktop (1024px+)
- Garden plots displayed in rows of 3-4
- Dice area at bottom
- Shop as modal/sidebar overlay

### Tablet (768px - 1023px)
- Garden plots in rows of 2-3
- Larger touch targets
- Same overall layout

### Mobile (< 768px)
- Single column layout
- Garden plots stacked vertically
- Dice controls at bottom
- Shop as full-screen overlay
- Larger buttons (min 44×44px)

## Settings Menu

Include gear icon (⚙️) in header with options:
- **Volume:** Slider (0-100%)
- **Mute All:** Toggle
- **Auto-Save:** Toggle (on by default)
- **Tutorial:** Reset tutorial / show again
- **Delete Save:** Confirmation required
- **About:** Game version, credits
- **Close:** Return to game

## Win Condition / End Goal

### Milestone Mode (Primary Mode)
Progressive goals:

**Milestone 1:** Earn $100 total → Reward: +$25 bonus
**Milestone 2:** Own 3 plots → Reward: Free water die
**Milestone 3:** Reach Level 5 → Reward: Unlock Endless Mode
**Milestone 4:** Earn $500 total → Reward: "Master Gardener" badge

### Endless Mode (Unlocked)
- No win condition
- Track high scores: "Best single turn profit"
- Display leaderboard (local only)
- Increasing difficulty: market volatility increases

## Error Handling & Edge Cases

1. **Not enough space:** Warn player before discarding crops
2. **Zero money:** Player can still play (harvest to earn)
3. **No water:** Crops can be planted but won't be ready until watered next turn
4. **Invalid purchase:** Disable buttons when can't afford
5. **Save corruption:** Gracefully handle, offer "New Game" option
6. **Browser compatibility:** Test on Chrome, Firefox, Safari

## Code Organization

### File Structure
```
veggie-dice/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── game.js (main game logic)
│   ├── ui.js (UI rendering)
│   ├── dice.js (dice physics/animation)
│   ├── shop.js (shop system)
│   ├── achievements.js
│   ├── save.js (save/load)
│   └── tutorial.js
├── assets/
│   ├── images/
│   │   └── dice/ (dice face images)
│   └── sounds/
│       └── *.mp3
└── README.md
```

### Key Functions to Implement

```javascript
// Core game loop
function startTurn() { }
function marketPhase() { }
function planningPhase() { }
function plantingPhase() { }
function wateringPhase() { }
function harvestPhase() { }
function shopPhase() { }
function endTurn() { }

// Game state
function initGame() { }
function resetGame() { }
function saveGame() { }
function loadGame() { }

// Market
function updateMarketPrices() { }
function displayMarketPrices() { }

// Garden
function renderGarden() { }
function placeCrop(plotId, spaceId, cropType) { }
function waterCrop(plotId, spaceId, waterAmount) { }
function harvestReadyCrops() { }
function buyGardenPlot() { }

// Dice
function rollDice(diceArray) { } // Returns array of values
function animateDiceRoll(dieType, finalValue) { }

// Shop
function displayShop() { }
function purchaseItem(itemType, itemId) { }
function canAfford(cost) { }

// Progression
function gainXP(amount) { }
function checkLevelUp() { }
function unlockCrop(cropType) { }
function checkAchievements() { }
function awardAchievement(achievementId) { }

// UI helpers
function showModal(title, content) { }
function showToast(message) { }
function updateHeader() { }
function updateMoneyDisplay(amount) { }

// Upgrades
function applyUpgradeEffects(upgrade) { }
function hasUpgrade(upgradeName) { }
```

## Testing Checklist

Before considering complete, test:
- [ ] Complete turn 1 with tutorial
- [ ] Plant crops and harvest successfully
- [ ] Market prices update each turn
- [ ] Shop purchases work correctly
- [ ] Save and load game
- [ ] Level up and unlock new crops
- [ ] Each upgrade functions correctly
- [ ] Achievements trigger appropriately
- [ ] All edge cases handle gracefully
- [ ] Responsive on mobile, tablet, desktop
- [ ] Audio plays correctly (if implemented)
- [ ] Tutorial can be skipped
- [ ] Game can be reset

## Polish & Nice-to-Haves

If time permits, add:
- **Statistics page:** Total earnings, crops harvested, turns played, time played
- **Daily bonus:** Log in daily for small money bonus
- **Crop combos:** "Salad Bowl" = lettuce + tomato + carrot harvested together (+$5 bonus)
- **Weather events:** Random events like "Sunny Day" (+10% to all prices) or "Rainstorm" (+3 free water)
- **Animations:** More elaborate harvest animations, confetti for achievements
- **Juice:** Screen shake on big harvests, particle effects, smooth transitions
- **Sound mixing:** Layered sounds for multiple simultaneous harvests

## Final Notes

This game should feel:
- **Satisfying:** Dice rolls, placement, harvests all feel good
- **Strategic:** Meaningful decisions about which dice to roll, what to water
- **Progressive:** Constant unlocks and improvements
- **Accessible:** Easy to learn, forgiving, clear feedback
- **Polished:** Smooth animations, pleasant sounds, clean UI

**Target completion:** Fully playable MVP with core features, tutorial, save system, and at least 3 unlockable crops.

---

## Summary of Deliverables

Build a complete single-player web game with:
1. ✅ 6-phase turn system (Market → Plan → Plant → Water → Harvest → Shop)
2. ✅ 7 crop types (3 starter + 4 unlockable)
3. ✅ Expandable 3×3 garden plot system
4. ✅ Dice rolling with physics or animation
5. ✅ Market price fluctuation system
6. ✅ XP/leveling progression
7. ✅ Shop with purchasable dice, plots, water dice, upgrades
8. ✅ 6 upgrades with unique effects
9. ✅ 8+ achievements
10. ✅ Save/load system
11. ✅ Tutorial for new players
12. ✅ Responsive design (mobile/desktop)
13. ✅ Visual polish (animations, colors, layout)
14. ✅ Audio (optional but recommended)

**Go build an amazing farming dice game!** 🎲🌱