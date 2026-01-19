# Dice Farmer

A single-player dice-rolling farm management game built with vanilla JavaScript.

## Play the Game

Roll dice to plant crops, manage water resources, harvest for profit, and expand your garden!

### How to Play

1. **Market Phase** - Watch market prices fluctuate each turn
2. **Planning Phase** - Select which crop dice to roll
3. **Planting Phase** - Roll dice and place crops in your garden (each pip = 1 crop)
4. **Watering Phase** - Distribute water to your crops (most need 2 water to be ready)
5. **Harvest Phase** - Ready crops are automatically harvested and sold
6. **Shop Phase** - Buy new dice, expand your garden, or purchase upgrades

### Crops

| Crop | Base Price | Water Needed | Unlock Level |
|------|------------|--------------|--------------|
| Tomato | $2 | 2 | 1 |
| Corn | $3 | 2 | 1 |
| Lettuce | $2 | 2 | 1 |
| Carrot | $4 | 1 | 2 |
| Eggplant | $6 | 3 | 5 |

### Upgrades

- **Fertilizer** ($30) - +1 to all crop dice rolls
- **Compost Bin** ($40) - Gain $1 per discarded crop
- **Irrigation System** ($60) - Water dice minimum value = 3

## Running Locally

No build step required! Just serve the files with any static server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## Tech Stack

- HTML5
- CSS3 (Grid layout, animations)
- Vanilla JavaScript (no frameworks)
- LocalStorage for save/load

## Project Structure

```
dice-farmer/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── game.js        # Core game logic & phases
│   ├── ui.js          # UI rendering
│   ├── dice.js        # Dice animations
│   ├── shop.js        # Shop system
│   ├── achievements.js # Achievement tracking
│   ├── save.js        # Save/load system
│   └── main.js        # Entry point & event listeners
└── README.md
```

## Features

- 6-phase turn-based gameplay
- 5 crop types with different properties
- Expandable 3x3 garden plots
- Dynamic market prices (fluctuate each turn)
- XP/leveling system with crop unlocks
- 3 purchasable upgrades
- Auto-save to localStorage
- Responsive design (mobile-friendly)

## License

MIT
