// YTBG - Yes, The Best Game
// En Minecraft-klon med verklighetstrogen grafik

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.player = null;
        this.controls = {};
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedSlot = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.clock = new THREE.Clock();
        this.fpsCounter = 0;
        this.fpsTime = 0;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupLights();
        this.setupPlayer();
        this.setupWorld();
        this.setupEventListeners();
        this.hideLoading();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Himmelsblå
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 100);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 30, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(50, 100, 50);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        // Hemisphere light for sky
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x6B8E23, 0.3);
        this.scene.add(hemiLight);
    }

    setupPlayer() {
        this.player = {
            position: new THREE.Vector3(0, 30, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            speed: 5,
            jumpForce: 8,
            gravity: 20,
            onGround: false,
            height: 1.7,
            radius: 0.3
        };
    }

    setupWorld() {
        this.world = new World(this.scene);
        this.world.generate();
    }

    setupEventListeners() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        // Resume button
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resumeGame();
        });

        // Main menu button
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.backToMenu();
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.isPaused) return;
            
            this.controls[e.code] = true;

            // Hotbar selection
            if (e.code >= 'Digit1' && e.code <= 'Digit5') {
                this.selectSlot(parseInt(e.code.replace('Digit', '')) - 1);
            }

            // Pause
            if (e.code === 'Escape') {
                this.pauseGame();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.controls[e.code] = false;
        });

        // Mouse controls
        document.addEventListener('mousemove', (e) => {
            if (!this.isPlaying || this.isPaused) return;

            const sensitivity = 0.002;
            this.player.rotation.y -= e.movementX * sensitivity;
            this.player.rotation.x -= e.movementY * sensitivity;
            this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));
        });

        document.addEventListener('mousedown', (e) => {
            if (!this.isPlaying || this.isPaused) return;

            if (e.button === 0) {
                // Left click - break block
                this.breakBlock();
            } else if (e.button === 2) {
                // Right click - place block
                this.placeBlock();
            }
        });

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    startGame() {
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('crosshair').classList.remove('hidden');
        document.getElementById('hud').classList.remove('hidden');
        
        this.isPlaying = true;
        this.lockPointer();
        this.animate();
    }

    pauseGame() {
        this.isPaused = true;
        document.getElementById('pause-menu').classList.remove('hidden');
        document.exitPointerLock();
    }

    resumeGame() {
        this.isPaused = false;
        document.getElementById('pause-menu').classList.add('hidden');
        this.lockPointer();
    }

    backToMenu() {
        this.isPlaying = false;
        this.isPaused = false;
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('crosshair').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        document.exitPointerLock();
    }

    lockPointer() {
        this.renderer.domElement.requestPointerLock();
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('menu').classList.remove('hidden');
        }, 1000);
    }

    selectSlot(slot) {
        this.selectedSlot = slot;
        document.querySelectorAll('.hotbar-slot').forEach((el, i) => {
            el.classList.toggle('active', i === slot);
        });
    }

    breakBlock() {
        const intersect = this.getTargetBlock();
        if (intersect) {
            const pos = intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(-0.5));
            const blockPos = {
                x: Math.floor(pos.x),
                y: Math.floor(pos.y),
                z: Math.floor(pos.z)
            };
            this.world.removeBlock(blockPos.x, blockPos.y, blockPos.z);
        }
    }

    placeBlock() {
        const intersect = this.getTargetBlock();
        if (intersect) {
            const pos = intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(0.5));
            const blockPos = {
                x: Math.floor(pos.x),
                y: Math.floor(pos.y),
                z: Math.floor(pos.z)
            };
            
            // Check if block would intersect with player
            const playerBlock = {
                x: Math.floor(this.player.position.x),
                y: Math.floor(this.player.position.y),
                z: Math.floor(this.player.position.z)
            };
            
            if (blockPos.x !== playerBlock.x || blockPos.z !== playerBlock.z ||
                (blockPos.y !== playerBlock.y && blockPos.y !== playerBlock.y - 1)) {
                
                const blockTypes = ['grass', 'dirt', 'stone', 'wood', 'sand'];
                const blockType = blockTypes[this.selectedSlot];
                this.world.addBlock(blockPos.x, blockPos.y, blockPos.z, blockType);
            }
        }
    }

    getTargetBlock() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = this.raycaster.intersectObjects(this.world.blocks);
        
        if (intersects.length > 0) {
            return intersects[0];
        }
        return null;
    }

    updatePlayer(delta) {
        // Movement
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.player.rotation.y, 0));
        const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.player.rotation.y, 0));

        const moveVector = new THREE.Vector3(0, 0, 0);
        
        if (this.controls['KeyW']) moveVector.add(forward);
        if (this.controls['KeyS']) moveVector.sub(forward);
        if (this.controls['KeyD']) moveVector.add(right);
        if (this.controls['KeyA']) moveVector.sub(right);

        if (moveVector.length() > 0) {
            moveVector.normalize().multiplyScalar(this.player.speed * delta);
            this.player.position.x += moveVector.x;
            this.player.position.z += moveVector.z;
        }

        // Jumping
        if (this.controls['Space'] && this.player.onGround) {
            this.player.velocity.y = this.player.jumpForce;
            this.player.onGround = false;
        }

        // Gravity
        this.player.velocity.y -= this.player.gravity * delta;
        this.player.position.y += this.player.velocity.y * delta;

        // Ground collision
        const groundHeight = this.world.getHeightAt(this.player.position.x, this.player.position.z) + this.player.height;
        if (this.player.position.y <= groundHeight) {
            this.player.position.y = groundHeight;
            this.player.velocity.y = 0;
            this.player.onGround = true;
        } else {
            this.player.onGround = false;
        }

        // Update camera
        this.camera.position.copy(this.player.position);
        this.camera.rotation.set(this.player.rotation.x, this.player.rotation.y, 0);

        // Update HUD
        document.getElementById('position').textContent = 
            `X: ${this.player.position.x.toFixed(1)}, Y: ${this.player.position.y.toFixed(1)}, Z: ${this.player.position.z.toFixed(1)}`;
    }

    updateFPS(delta) {
        this.fpsCounter++;
        this.fpsTime += delta;
        
        if (this.fpsTime >= 1) {
            document.getElementById('fps').textContent = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsTime = 0;
        }
    }

    animate() {
        if (!this.isPlaying) return;

        requestAnimationFrame(() => this.animate());

        if (this.isPaused) return;

        const delta = this.clock.getDelta();
        
        this.updatePlayer(delta);
        this.updateFPS(delta);
        
        this.renderer.render(this.scene, this.camera);
    }
}

class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = [];
        this.chunkSize = 16;
        this.worldSize = 5; // Number of chunks in each direction
        this.blockSize = 1;
        this.simplex = new SimplexNoise();
        this.materials = this.createMaterials();
    }

    createMaterials() {
        return {
            grass: new THREE.MeshStandardMaterial({
                color: 0x567d46,
                roughness: 0.8,
                metalness: 0.2
            }),
            dirt: new THREE.MeshStandardMaterial({
                color: 0x8b7355,
                roughness: 0.9,
                metalness: 0.1
            }),
            stone: new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.7,
                metalness: 0.3
            }),
            wood: new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                roughness: 0.8,
                metalness: 0.1
            }),
            sand: new THREE.MeshStandardMaterial({
                color: 0xc2b280,
                roughness: 0.95,
                metalness: 0.05
            })
        };
    }

    generate() {
        const halfWorld = Math.floor(this.worldSize / 2);
        
        for (let cx = -halfWorld; cx <= halfWorld; cx++) {
            for (let cz = -halfWorld; cz <= halfWorld; cz++) {
                this.generateChunk(cx, cz);
            }
        }
    }

    generateChunk(chunkX, chunkZ) {
        const startX = chunkX * this.chunkSize;
        const startZ = chunkZ * this.chunkSize;

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = startX + x;
                const worldZ = startZ + z;
                
                // Generate terrain height using simplex noise
                const height = this.getTerrainHeight(worldX, worldZ);
                
                // Generate blocks from bottom to height
                for (let y = 0; y <= height; y++) {
                    let blockType = 'stone';
                    
                    if (y === height) {
                        blockType = height < 8 ? 'sand' : 'grass';
                    } else if (y >= height - 3) {
                        blockType = 'dirt';
                    }
                    
                    this.createBlock(worldX, y, worldZ, blockType);
                }

                // Add some trees randomly on grass
                if (height >= 8 && Math.random() < 0.02) {
                    this.generateTree(worldX, height + 1, worldZ);
                }
            }
        }
    }

    getTerrainHeight(x, z) {
        const scale = 0.05;
        const noise1 = this.simplex.noise2D(x * scale, z * scale);
        const noise2 = this.simplex.noise2D(x * scale * 2, z * scale * 2) * 0.5;
        const combinedNoise = (noise1 + noise2) / 1.5;
        
        return Math.floor(10 + combinedNoise * 8);
    }

    generateTree(x, y, z) {
        // Trunk
        for (let i = 0; i < 5; i++) {
            this.createBlock(x, y + i, z, 'wood');
        }
        
        // Leaves
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 0; dy < 3; dy++) {
                    if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && dy < 2) continue;
                    if (dx === 0 && dz === 0) continue;
                    
                    this.createBlock(x + dx, y + 4 + dy, z + dz, 'grass');
                }
            }
        }
    }

    createBlock(x, y, z, type) {
        const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        const material = this.materials[type];
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { x, y, z, type };
        
        this.scene.add(mesh);
        this.blocks.push(mesh);
        
        return mesh;
    }

    addBlock(x, y, z, type) {
        // Check if block already exists
        const existingBlock = this.blocks.find(block => 
            block.userData.x === x && block.userData.y === y && block.userData.z === z
        );
        
        if (!existingBlock) {
            this.createBlock(x, y, z, type);
        }
    }

    removeBlock(x, y, z) {
        const blockIndex = this.blocks.findIndex(block => 
            block.userData.x === x && block.userData.y === y && block.userData.z === z
        );
        
        if (blockIndex !== -1) {
            const block = this.blocks[blockIndex];
            this.scene.remove(block);
            block.geometry.dispose();
            this.blocks.splice(blockIndex, 1);
        }
    }

    getHeightAt(x, z) {
        const blockX = Math.floor(x);
        const blockZ = Math.floor(z);
        
        let maxHeight = 0;
        
        for (const block of this.blocks) {
            if (Math.floor(block.position.x) === blockX && 
                Math.floor(block.position.z) === blockZ) {
                maxHeight = Math.max(maxHeight, block.position.y + 0.5);
            }
        }
        
        return maxHeight;
    }
}

// Start the game
const game = new Game();
