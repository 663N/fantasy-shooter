# Fantasy Shooter - Battle Arena

A medium-difficulty arcade action shooter where you play as a powerful wizard defending against waves of magical enemies!

## 🎮 Game Overview

Battle through endless waves of fantasy enemies:
- **Goblins** (green, fast, weak)
- **Wizards** (pink, medium speed, medium damage)
- **Demons** (red, slow, powerful)

Each wave gets harder! Manage your mana, dodge incoming attacks, and rack up your score.

## 🕹️ Controls

| Action | Key |
|--------|-----|
| **Move Left** | ← or A |
| **Move Right** | → or D |
| **Move Up** | ↑ or W |
| **Move Down** | ↓ or S |
| **Shoot Fireball** | SPACE |
| **Dodge/Dash** | SHIFT |
| **Pause** | ESC |

## 🎯 Gameplay Mechanics

### Player (Wizard)
- **Health**: 100 HP - avoid enemy attacks!
- **Mana**: 100 MP - needed to cast fireballs (costs 15 mana each)
- **Mana Regen**: Slowly regenerates when not casting
- **Speed**: Move around the arena to dodge attacks

### Shooting
- Press **SPACE** to shoot fireballs
- Each fireball costs 15 mana
- Deals 25 damage to enemies
- Fast cooldown (10 frames)

### Dodging
- Press **SHIFT** to perform a quick dodge/dash
- Lasts 10 frames - become invincible during dodge!
- Cooldown: 60 frames (2 seconds)
- Perfect for dodging incoming enemy attacks

### Enemies
- **Goblins**: 30 HP, 2 speed, 80 shoot interval, 10 damage
- **Wizards**: 50 HP, 1.5 speed, 60 shoot interval, 15 damage
- **Demons**: 80 HP, 1 speed, 100 shoot interval, 20 damage

### Waves
- Each wave spawns 3 + wave number enemies
- New wave starts when all enemies are defeated
- Difficulty increases with each wave
- Score scales: 100 + (wave × 50) points per kill

## 📊 HUD Display

**Top Left:**
- Current Health
- Score
- Mana (current/max)

**Top Right:**
- Current Wave
- Enemies Remaining

**Bottom:**
- Control Instructions

## 🏆 Scoring

- Each enemy defeated: **100 + (Wave × 50) points**
- Example: Wave 1 enemy = 150 points, Wave 2 enemy = 200 points, etc.
- Beat your high score in each playthrough!

## 🎨 Visual Design

### Colors
- **Player**: Purple robe with pointed hat
- **Goblins**: Green squares (fast threats)
- **Wizards**: Pink squares (magic attacks)
- **Demons**: Red squares (heavy damage)
- **Fireballs**: Pink with orange core
- **Enemy Attacks**: Green squares

### Visual Effects
- Particle explosions on hits
- Health bars above enemies
- Dodge transparency effect
- Muzzle flash particles on shooting

## 💡 Strategy Tips

1. **Manage Your Mana** - Don't waste it; wait for good shots
2. **Keep Moving** - Enemy projectiles come from all angles
3. **Use Dodge Wisely** - Save it for critical moments
4. **Focus Fire** - Eliminate threats in priority order (Demons > Wizards > Goblins)
5. **Space Management** - Use the full arena, don't get cornered
6. **Wave Prep** - New wave starts immediately after last enemy dies

## 🎲 Difficulty Progression

| Wave | Enemy Count | Enemy Types | Challenge |
|------|-------------|-------------|-----------|
| 1-3 | 3-5 | Mostly Goblins | Learning |
| 4-6 | 6-8 | Mixed | Getting Harder |
| 7-10 | 9-12 | More Demons | Challenging |
| 11+ | 13+ | Demon Heavy | Extreme |

## 🛠️ Technical Details

### Built With
- **HTML5 Canvas** - 2D rendering
- **Vanilla JavaScript** - Game engine
- **CSS3** - UI styling

### Game Features
- **Real-time Collision Detection** - Precise hit detection
- **Particle System** - Visual feedback for impacts
- **Wave Spawner** - Progressive difficulty
- **State Management** - Health, mana, score tracking
- **Pause System** - ESC to pause anytime

### File Structure
- `index.html` - Game UI and canvas setup
- `game.js` - Complete game engine (800+ lines)

## 🚀 How to Play

1. **Go to**: https://github.com/663N/fantasy-shooter
2. **Play Online**: Open `index.html` in your browser
   - Click Raw button on index.html OR
   - Use: https://raw.githubusercontent.com/663N/fantasy-shooter/main/index.html

3. **Or use Replit**:
   - Go to https://replit.com
   - Click "Import from GitHub"
   - Paste: https://github.com/663N/fantasy-shooter
   - Click "Run"

## 📈 Challenge Yourself

- **Easy Mode**: Just survive as many waves as you can
- **Score Attack**: Get the highest score possible
- **Speed Run**: How fast can you reach Wave 10?
- **No Dodge**: Try beating the game without using SHIFT
- **Pacifist**: How long can you dodge without shooting?

## 🎓 Learning Outcomes

This game demonstrates:
- Game loop architecture
- Physics and collision detection
- Input handling and controls
- Enemy AI and pathfinding
- Particle effects and visual feedback
- Wave-based difficulty scaling
- State management in games
- Canvas 2D rendering

## 🎬 Credits

Inspired by:
- Classic arcade shooters
- Fantasy RPG mechanics
- Tower defense games

Built for Chromebook with vanilla JavaScript - no installations needed!

---

**How many waves can YOU survive?** 🧙‍♂️⚔️✨