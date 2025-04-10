import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

let scene, camera, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();

const artworkMeshes = []; // To store meshes for raycasting
const textureLoader = new THREE.TextureLoader();

// --- Gallery Constants ---
const wallHeight = 5;
const wallThickness = 0.2;
const roomSize = 20;
const artworkElevation = 1.8; // How high the center of the artwork is from the floor

// --- Artwork Data (Placeholders) ---
const artworksData = [
    // Back Wall (Z = -roomSize / 2 + wallThickness)
    { img: 'https://via.placeholder.com/300x200/FF0000/FFFFFF?text=Artwork+1', title: 'Red Square', desc: 'A study in red.', position: new THREE.Vector3(-6, artworkElevation, -roomSize / 2 + wallThickness + 0.01), rotation: new THREE.Euler(0, 0, 0) },
    { img: 'https://via.placeholder.com/200x300/00FF00/FFFFFF?text=Artwork+2', title: 'Green Rectangle', desc: 'Exploring verticality.', position: new THREE.Vector3(-2, artworkElevation, -roomSize / 2 + wallThickness + 0.01), rotation: new THREE.Euler(0, 0, 0) },
    { img: 'https://via.placeholder.com/300x300/0000FF/FFFFFF?text=Artwork+3', title: 'Blue Cube', desc: 'Perfectly balanced.', position: new THREE.Vector3(2, artworkElevation, -roomSize / 2 + wallThickness + 0.01), rotation: new THREE.Euler(0, 0, 0) },
    { img: 'https://via.placeholder.com/400x200/FFFF00/000000?text=Artwork+4', title: 'Yellow Landscape', desc: 'Wide and bright.', position: new THREE.Vector3(6, artworkElevation, -roomSize / 2 + wallThickness + 0.01), rotation: new THREE.Euler(0, 0, 0) },
    // Left Wall (X = -roomSize / 2 + wallThickness)
    { img: 'https://via.placeholder.com/250x250/FF00FF/FFFFFF?text=Artwork+5', title: 'Magenta Mix', desc: 'A vibrant piece.', position: new THREE.Vector3(-roomSize / 2 + wallThickness + 0.01, artworkElevation, -4), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
    { img: 'https://via.placeholder.com/250x350/00FFFF/000000?text=Artwork+6', title: 'Cyan Flow', desc: 'Cool and calm.', position: new THREE.Vector3(-roomSize / 2 + wallThickness + 0.01, artworkElevation, 4), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
    // Right Wall (X = roomSize / 2 - wallThickness)
    { img: 'https://via.placeholder.com/300x200/FFA500/FFFFFF?text=Artwork+7', title: 'Orange Slice', desc: 'Warm tones.', position: new THREE.Vector3(roomSize / 2 - wallThickness - 0.01, artworkElevation, -6), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
    { img: 'https://via.placeholder.com/200x400/800080/FFFFFF?text=Artwork+8', title: 'Purple Tower', desc: 'Reaching high.', position: new THREE.Vector3(roomSize / 2 - wallThickness - 0.01, artworkElevation, -2), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
    { img: 'https://via.placeholder.com/300x300/FFFFFF/000000?text=Artwork+9', title: 'White Noise', desc: 'Silence.', position: new THREE.Vector3(roomSize / 2 - wallThickness - 0.01, artworkElevation, 2), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
    { img: 'https://via.placeholder.com/400x300/000000/FFFFFF?text=Artwork+10', title: 'Black Canvas', desc: 'The void.', position: new THREE.Vector3(roomSize / 2 - wallThickness - 0.01, artworkElevation, 6), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
];


// Make initGallery globally accessible for the callback in index.html
window.initGallery = function() {
    console.log("Initializing Gallery...");

    // --- Basic Setup ---
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    scene.fog = new THREE.Fog(0x87CEEB, 0, 50); // Adjust fog distance

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5); // Start position (eye level, slightly back)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('gallery-container').appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Slightly brighter ambient
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Slightly brighter directional
    directionalLight.position.set(10, 15, 10);
    // Optional: Add shadows
    // directionalLight.castShadow = true;
    // renderer.shadowMap.enabled = true;
    scene.add(directionalLight);

    // Optional: Add a light pointing from the camera
    // const pointLight = new THREE.PointLight(0xffffff, 0.5);
    // camera.add(pointLight); // Attach light to camera
    // scene.add(camera); // Add camera (with light) to scene

    // --- Gallery Geometry ---
    // Floor
    const floorTexture = textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg'); // Example texture
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(20, 20); // Repeat texture
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    // floor.receiveShadow = true; // Optional shadows
    scene.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.8 }); // Slightly rough off-white walls

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomSize, wallHeight, wallThickness), wallMaterial);
    backWall.position.set(0, wallHeight / 2, -roomSize / 2);
    // backWall.receiveShadow = true;
    scene.add(backWall);

    // Front wall (Partial - leaving an opening)
    const frontWallSideWidth = roomSize / 2 - 2; // Opening width of 4 units
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(frontWallSideWidth, wallHeight, wallThickness), wallMaterial);
    frontWallLeft.position.set(-(roomSize / 2 - frontWallSideWidth / 2), wallHeight / 2, roomSize / 2);
    // frontWallLeft.receiveShadow = true;
    scene.add(frontWallLeft);
    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(frontWallSideWidth, wallHeight, wallThickness), wallMaterial);
    frontWallRight.position.set((roomSize / 2 - frontWallSideWidth / 2), wallHeight / 2, roomSize / 2);
    // frontWallRight.receiveShadow = true;
    scene.add(frontWallRight);
    const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(roomSize - 2 * frontWallSideWidth, wallHeight * 0.3, wallThickness), wallMaterial); // Lintel
    frontWallTop.position.set(0, wallHeight * 0.85, roomSize / 2); // Position above opening
    scene.add(frontWallTop);


    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, roomSize), wallMaterial);
    leftWall.position.set(-roomSize / 2, wallHeight / 2, 0);
    // leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, roomSize), wallMaterial);
    rightWall.position.set(roomSize / 2, wallHeight / 2, 0);
    // rightWall.receiveShadow = true;
    scene.add(rightWall);

    // --- Load Artworks ---
    loadArtworks();

    // --- Controls ---
    controls = new PointerLockControls(camera, renderer.domElement);

    renderer.domElement.addEventListener('click', () => {
        if (!controls.isLocked) {
            controls.lock();
        } else {
            // Handle artwork clicks when locked (see animate function)
        }
    });

    controls.addEventListener('lock', () => {
        console.log('Pointer locked');
        document.getElementById('instructions').style.display = 'block';
    });

    controls.addEventListener('unlock', () => {
        console.log('Pointer unlocked');
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('artwork-details').style.display = 'none'; // Hide details on unlock
    });

    scene.add(controls.getObject());

    // --- Keyboard Input ---
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // --- Window Resize ---
    window.addEventListener('resize', onWindowResize);

    // --- Raycaster for Interaction ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(); // Use center of screen for interaction

    // Add click listener for interaction when pointer is locked
    renderer.domElement.addEventListener('click', () => {
        if (controls.isLocked) {
            interactWithArtwork();
        }
    });

    function interactWithArtwork() {
        // Raycast from camera center
        raycaster.setFromCamera(pointer, camera); // pointer is (0,0) - center

        const intersects = raycaster.intersectObjects(artworkMeshes);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            // Find corresponding artwork data
            const artworkData = artworksData.find(art => art.mesh === intersectedObject);

            if (artworkData) {
                console.log("Clicked on:", artworkData.title);
                // Show details
                document.getElementById('artwork-title').textContent = artworkData.title;
                document.getElementById('artwork-description').textContent = artworkData.desc;
                document.getElementById('artwork-details').style.display = 'block';
            }
        } else {
            // Clicked elsewhere, hide details
            document.getElementById('artwork-details').style.display = 'none';
        }
    }


    // --- Start Animation ---
    animate();
}

function loadArtworks() {
    artworksData.forEach(data => {
        const texture = textureLoader.load(
            data.img,
            (tex) => { // onLoad callback
                // Get aspect ratio to size the plane correctly
                const aspectRatio = tex.image.naturalWidth / tex.image.naturalHeight;
                const artworkWidth = 1.5; // Base width for artworks
                const artworkHeight = artworkWidth / aspectRatio;
                const geometry = new THREE.PlaneGeometry(artworkWidth, artworkHeight);
                const material = new THREE.MeshStandardMaterial({
                    map: tex,
                    color: 0xffffff, // Ensure texture colors aren't tinted
                    roughness: 0.7,
                    metalness: 0.1 // Slightly metallic to catch light
                });
                const mesh = new THREE.Mesh(geometry, material);

                mesh.position.copy(data.position);
                mesh.rotation.copy(data.rotation);
                // mesh.castShadow = true; // Optional

                // Store reference to data in mesh for raycasting
                mesh.userData = data;
                data.mesh = mesh; // Store mesh reference back in data (optional)

                scene.add(mesh);
                artworkMeshes.push(mesh); // Add to array for raycasting
                console.log("Loaded artwork:", data.title);
            },
            undefined, // onProgress callback (optional)
            (err) => { // onError callback
                console.error(`Error loading texture for ${data.title}:`, err);
                // Optionally load a fallback texture/material
            }
        );
    });
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked === true) {
        // Reset velocity damping
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // Ensures consistent movement speed

        const speed = 40.0; // Movement speed factor
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
    }

    prevTime = time;
    renderer.render(scene, camera);
}

// Note: initGallery() is called from index.html after successful Google Sign-In
