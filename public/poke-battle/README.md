# PokeBattle 🎮

A Clash Royale-style tower defense game with unique creatures!

## Features

- 🎯 **5 Unique Creatures** - Each with different stats and abilities
- 🏰 **Tower Defense** - Protect your tower while destroying the enemy's
- 💰 **Economy System** - Earn coins to deploy creatures
- 🎚️ **3 Difficulty Levels** - Easy, Normal, and Hard
- 🎵 **Sound Effects** - Full audio feedback for all actions
- ⏸️ **Pause/Resume** - Full game control
- 🎨 **Isometric Graphics** - Beautiful diamond-shaped creatures

## How to Play

### Starting the Game
```bash
npm install
npm start
```

Then open your browser to `http://localhost:3000`

### Controls

**Mouse:**
- Click a creature card to select it
- Click on the bottom half of the battlefield to deploy

**Keyboard Shortcuts:**
- `SPACE` or `ESC` - Pause/Resume
- `R` - Restart game
- `M` - Toggle sound on/off

### Creatures

| Creature | Cost | HP | Damage | Speed | Special |
|----------|------|----|----|-------|---------|
| 🔥 **Flamewing** | 25 | 100 | 18 | Fast | Balanced attacker |
| 💧 **Aquabeast** | 30 | 150 | 15 | Medium | Tank with good damage |
| 🪨 **Rockgolem** | 40 | 250 | 10 | Slow | Heavy tank |
| ⚡ **Voltiger** | 28 | 80 | 25 | Very Fast | Glass cannon |
| 💨 **Skytalon** | 20 | 65 | 12 | Fastest | Cheap & fast |

### Difficulty Levels

**🟢 Easy:**
- 6 coins/second
- 2000 tower health
- +30% player creature strength
- -30% enemy creature strength
- Slower enemy spawns

**🟡 Normal:**
- 4 coins/second
- 1500 tower health
- Balanced stats
- Normal enemy spawns

**🔴 Hard:**
- 3 coins/second
- 1000 tower health
- -20% player creature strength
- +30% enemy creature strength
- Faster enemy spawns

### Strategy Tips

1. **Start cheap** - Deploy Skytalons early to get board presence
2. **Use tanks** - Rockgolem absorbs damage for your other creatures
3. **Mix types** - Combine fast and slow creatures for balance
4. **Save coins** - Don't overspend early, enemies get harder
5. **Watch spawns** - Enemy spawn rate increases each level

## Sound Effects

The game features procedurally generated sound effects:
- ✨ Deploy - Creature deployment
- ⚔️ Attack - Projectile launch
- 💥 Hit - Damage dealt
- 💰 Coin - Coin generation (every 5s)
- 🎉 Victory - Level complete
- 💀 Defeat - Tower destroyed
- 🆙 Level Up - New level starts
- 🏰 Tower Hit - Tower damage

## Level Progression

Difficulty increases with each level:
- Tower health scales up (Easy: 1.25x, Normal: 1.35x, Hard: 1.5x per level)
- Enemy spawn rate increases
- 10 levels total to complete

## Technologies Used

- **Frontend:** HTML5 Canvas, Vanilla JavaScript
- **Backend:** Node.js, Express
- **Audio:** Web Audio API
- **Graphics:** Custom 2D isometric rendering

## Development

Run with auto-reload:
```bash
npm run dev
```

## License

MIT

---

Made with ❤️ for fun!
