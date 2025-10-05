# Björns Spelhemsida

En samling av webbaserade spel skapade med moderna webbteknologier.

## Spel

### 🎮 YTBG (Yes, The Best Game)
En Minecraft-klon med verklighetstrogen grafik istället för block. Byggd med Three.js.

**Funktioner:**
- Procedurellt genererad terräng med Simplex Noise
- Realistisk 3D-grafik med PBR-material
- Första-person kontroller
- Bryt och placera block
- 5 olika blocktyper

**Teknologier:** Three.js, SimplexNoise

### ⭐ Star Battle
Ett rymdskjutningsspel där du flyger ett rymdskepp och skjuter fiender.

### 🎴 PokeBattle
Ett Clash Royale-liknande varelse-battlespel.

### 🏓 Pong
Den klassiska Pong-spelet.

## Installation

```bash
# Installera dependencies
npm install

# Starta servern
npm start

# För utveckling (med auto-reload)
npm run dev
```

## Användning

1. Starta servern med `npm start`
2. Öppna webbläsaren på `http://localhost:3000`
3. Välj vilket spel du vill spela!

## Projektstruktur

```
Björns Hemsida/
├── public/               # Statiska filer
│   ├── ytbg/            # YTBG Minecraft-klon
│   ├── star-battle/     # Star Battle spel
│   ├── poke-battle/     # PokeBattle spel
│   ├── Index.html       # Huvudsida
│   └── spel.html        # Spelmeny
├── server.js            # Express server
└── package.json         # Dependencies
```

## Teknologier

- **Express.js** - Webb server
- **Three.js** - 3D-grafik
- **SimplexNoise** - Procedurellt genererad terräng
- **HTML5 Canvas** - 2D-grafik

## Utveckling

Servern använder Express för att servera statiska filer från `public`-mappen. Alla spel är tillgängliga via olika routes.

## Licens

MIT

---

Skapat av Björn 🎮
