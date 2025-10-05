# YTBG - Yes, The Best Game

En Minecraft-klon med verklighetstrogen grafik istället för block, byggd med Three.js.

## Funktioner

- **Realistisk 3D-grafik** - Använder Three.js för verklighetstrogen rendering
- **Procedurellt genererad terräng** - Använder simplex noise för naturlig terränggenerering
- **Olika blocktyper** - Gräs, jord, sten, trä och sand med realistiska material
- **Träd** - Slumpmässigt placerade träd över världen
- **Optimerad rendering** - Merged geometries för hög FPS
- **Dynamisk ljussättning** - Realistisk belysning
- **Spelarkontroller** - Första-person kontroller med rörelse, hopp och kamera

## Prestanda-optimiseringar

Spelet använder flera tekniker för att hålla hög FPS:

- **Merged geometries** - Alla block av samma typ slås ihop till en mesh
- **Lambert material** - Enklare shading än PBR för bättre prestanda  
- **Ingen antialiasing** - Stängs av för bättre FPS
- **Inga skuggor** - Shadow mapping avaktiverat
- **Begränsad vy-distans** - Fog och culling vid 100 units
- **Endast ytblock** - Renderar bara terrängens yta, inte alla block nedåt
- **Mindre värld** - 3x3 chunks istället för 5x5
- **Färre träd** - Reducerad täthet av träd

## Kontroller

- **Klicka på spelet** - Lås muspekare (krävs för att spela)
- **WASD** - Rörelse (framåt, bakåt, vänster, höger)
- **Mellanslag** - Hoppa
- **Mus** - Titta runt (när pekaren är låst)
- **Vänsterklick** - Bryt block (tillfälligt inaktiverat)
- **Högerklick** - Placera block
- **1-5** - Välj blocktyp i hotbar
- **ESC** - Pausa spelet (låser upp muspekare)

## Blocktyper

1. Gräs (grön)
2. Jord (brun)
3. Sten (grå)
4. Trä (mörkbrun)
5. Sand (beige)

## Teknisk implementation

- **Three.js** - 3D-grafik och rendering
- **SimplexNoise** - Procedurellt genererad terräng
- **PBR Materials** - Physically Based Rendering för realistiska material
- **Shadow mapping** - Realtidsskuggor
- **Raycasting** - Block selection och interaktion
- **Chunk-baserad världsgenerering** - Optimerad rendering

## Hur man spelar

1. Öppna `index.html` i en webbläsare
2. Klicka på "Starta Spel"
3. Använd WASD för att röra dig
4. Titta runt med musen
5. Bryt och placera block med vänster/höger musknapp
6. Utforska den procedurellt genererade världen!

## Credits

Skapad som en del av Björns spelhemsida.
Använder Three.js och SimplexNoise bibliotek.

---

**YTBG** - Eftersom det verkligen är det bästa spelet! 🎮
