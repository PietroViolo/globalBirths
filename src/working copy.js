import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import earthVertexShader from './shaders/earth/vertex.glsl';
import earthFragmentShader from './shaders/earth/fragment.glsl';
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl';
import Papa from 'papaparse'; // Ensure PapaParse is available

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

// Textures
const earthDayTexture = textureLoader.load('./earth/day.jpg');
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8;

const earthNightTexture = textureLoader.load('./earth/night.jpg');
earthNightTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.anisotropy = 8;

const earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg');
earthSpecularCloudsTexture.anisotropy = 8;

// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms: {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color('#00aaff')),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color('#ff6600')),
    },
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Atmosphere
const atmosphereMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms: {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color('#00aaff')),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color('#ff6600')),
    },
});

const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.set(1.04, 1.04, 1.04);
scene.add(atmosphere);

/**
 * Camera
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
});

const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 12;
camera.position.y = 5;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor('#000011');

/**
 * Glowing Particles
 */
const particles = []; // Store particle information

// Function to create a glowing particle
function createGlowingParticle(position, time) {
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position.toArray(), 3));

    const particleTexture = textureLoader.load('./textures/glow-particle.png');

    const particleMaterial = new THREE.PointsMaterial({
        map: particleTexture,
        color: 0xffff99, // Bright golden-yellow
        size: 0.2,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const particle = new THREE.Points(particleGeometry, particleMaterial);

    earth.add(particle);

    particles.push({
        particle,
        material: particleMaterial,
        timeToGlow: time * 1000, // Time in milliseconds when the particle should appear
        timeToFade: (time + 5) * 1000, // Time when the particle should fade away (5 seconds later)
    });
}

// Function to update particle opacity
function updateParticles(elapsedTime) {
    particles.forEach((particle) => {
        const roundedElapsedTime = Math.round(elapsedTime * 100) / 100; // Round to 2 decimal places

        // If elapsed time matches the timeToGlow, show the particle
        if (roundedElapsedTime === particle.timeToGlow / 1000 && particle.material.opacity === 0) {
            particle.material.opacity = 1.0; // Make the particle visible
        }

        // If elapsed time exceeds the fade time, hide the particle
        if (roundedElapsedTime >= particle.timeToFade / 1000 && particle.material.opacity === 1.0) {
            particle.material.opacity = 0.0; // Fade the particle out
        }
    });
}

/**
 * Load CSV Data
 */
Papa.parse('/data/deaths.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,  // Skip empty lines in the CSV
    dynamicTyping: true,    // Automatically convert numbers
    complete: (results) => {
        console.log('CSV Loaded:', results); // Debug: Log the loaded CSV data

        if (results.errors.length) {
            console.error('CSV Parse Errors:', results.errors); // Log any parsing errors
        } else {
            results.data.forEach((row) => {
                const lon = parseFloat(row.longitude);
                const lat = parseFloat(row.latitude);
                const time = parseFloat(row.time);  // Use the 'time' column

                // Ensure valid latitude and longitude
                if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                    const position = new THREE.Vector3();

                    // Convert latitude and longitude to radians
                    const latRad = THREE.MathUtils.degToRad(lat);  // Latitude in radians
                    const lonRad = THREE.MathUtils.degToRad(lon); // Longitude in radians

                    // Correctly calculate the position on the sphere
                    const radius = 2; // Same as Earth's radius in your scene
                    position.set(
                        radius * Math.cos(latRad) * Math.cos(lonRad), // Longitude affects X (cos(lon)) and Z (sin(lon))
                        radius * Math.sin(latRad),                    // Latitude affects Y
                        radius * Math.cos(latRad) * Math.sin(-lonRad)  // NEGATIVE for correct eastward longitude
                    );

                    createGlowingParticle(position, time); // Create a particle for each entry
                } else {
                    console.error(`Invalid coordinates: lat: ${lat}, lon: ${lon}`);
                }
            });
        }
    },
    error: (err) => {
        console.error('CSV Parsing Error:', err); // Log any error that occurs during parsing
    },
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    updateParticles(elapsedTime);  // Update particle visibility based on elapsed time

    // Rotate the Earth mesh around its Y-axis (vertical axis)
    earth.rotation.y += 0.0004; // Adjust this value for faster/slower rotation

    controls.update();
    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();
