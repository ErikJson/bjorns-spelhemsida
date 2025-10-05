const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

// Route for games page
app.get('/spel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'spel.html'));
});

// Route for YTBG game
app.get('/ytbg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ytbg', 'index.html'));
});

// Route for Star Battle
app.get('/star-battle', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'star-battle', 'index.html'));
});

// Route for PokeBattle
app.get('/poke-battle', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'poke-battle', 'index.html'));
});

// Route for Pong
app.get('/pong', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pong.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🎮 Björns Spelhemsida is running!`);
    console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
    console.log(`\n📂 Available games:`);
    console.log(`   - Main page: http://localhost:${PORT}/`);
    console.log(`   - Games: http://localhost:${PORT}/spel`);
    console.log(`   - YTBG (Minecraft): http://localhost:${PORT}/ytbg/`);
    console.log(`   - Star Battle: http://localhost:${PORT}/star-battle/`);
    console.log(`   - PokeBattle: http://localhost:${PORT}/poke-battle/`);
    console.log(`   - Pong: http://localhost:${PORT}/pong`);
    console.log(`\nPress Ctrl+C to stop the server.`);
});
