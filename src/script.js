import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import earthVertexShader from './shaders/earth/vertex.glsl';
import earthFragmentShader from './shaders/earth/fragment.glsl';
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl';
import Papa from 'papaparse';

/**
 * Base
 */
// Debug
//const gui = new GUI();

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
    transparent: false,
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
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 0.2)),
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
 * Text
 */

// Create a title element
const titleElement = document.createElement('div');
titleElement.style.position = 'absolute';
titleElement.style.top = '10px';
titleElement.style.width = '100%';
titleElement.style.textAlign = 'center';
titleElement.style.color = '#ffffff';
titleElement.style.fontSize = '36px';
titleElement.style.fontFamily = 'Augustus, sans-serif';
titleElement.style.fontWeight = 'bold';
titleElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
titleElement.style.zIndex = '1000';
titleElement.innerText = '';
document.body.appendChild(titleElement);

// Create a timer element
const timerElement = document.createElement('div');
timerElement.style.position = 'absolute';
timerElement.style.top = '20px';
timerElement.style.left = '20px';
timerElement.style.color = '#ffffff';
timerElement.style.fontSize = '20px';
timerElement.style.fontFamily = 'Augustus, sans-serif';
timerElement.style.background = 'rgba(0, 0, 0, 0.5)';
timerElement.style.padding = '10px';
timerElement.style.borderRadius = '5px';
timerElement.style.zIndex = '1000';
timerElement.innerText = 'Elapsed Time: 0.00s';
document.body.appendChild(timerElement);

// Create a total deaths element
const deathsElement = document.createElement('div');
deathsElement.style.position = 'absolute';
deathsElement.style.top = '60px';
deathsElement.style.left = '20px';
deathsElement.style.color = '#ffffff';
deathsElement.style.fontSize = '20px';
deathsElement.style.fontFamily = 'Augustus, sans-serif';
deathsElement.style.background = 'rgba(0, 0, 0, 0.5)';
deathsElement.style.padding = '10px';
deathsElement.style.borderRadius = '5px';
deathsElement.style.zIndex = '1000';
deathsElement.innerText = 'Total Births: 0';
//document.body.appendChild(deathsElement);


// Africa
const deathsElementAfrica = document.createElement('div');
deathsElementAfrica.style.position = 'absolute';
deathsElementAfrica.style.top = '120px';
deathsElementAfrica.style.left = '20px';
deathsElementAfrica.style.color = '#ffffff';
deathsElementAfrica.style.fontSize = '20px';
deathsElementAfrica.style.fontFamily = 'Augustus, sans-serif';
deathsElementAfrica.style.background = 'rgba(0, 0, 0, 0.5)';
deathsElementAfrica.style.padding = '10px';
deathsElementAfrica.style.borderRadius = '5px';
deathsElementAfrica.style.zIndex = '1000';
deathsElementAfrica.innerText = 'Total Births: 0';
//document.body.appendChild(deathsElementAfrica);


// Asia
const deathsElementAsia = document.createElement('div');
deathsElementAsia.style.position = 'absolute';
deathsElementAsia.style.top = '180px';
deathsElementAsia.style.left = '20px';
deathsElementAsia.style.color = '#ffffff';
deathsElementAsia.style.fontSize = '20px';
deathsElementAsia.style.fontFamily = 'Augustus, sans-serif';
deathsElementAsia.style.background = 'rgba(0, 0, 0, 0.5)';
deathsElementAsia.style.padding = '10px';
deathsElementAsia.style.borderRadius = '5px';
deathsElementAsia.style.zIndex = '1000';
deathsElementAsia.innerText = 'Total Births: 0';
//document.body.appendChild(deathsElementAsia);



// Europe
const deathsElementEurope = document.createElement('div');
deathsElementEurope.style.position = 'absolute';
deathsElementEurope.style.top = '240px';
deathsElementEurope.style.left = '20px';
deathsElementEurope.style.color = '#ffffff';
deathsElementEurope.style.fontSize = '20px';
deathsElementEurope.style.fontFamily = 'Augustus, sans-serif';
deathsElementEurope.style.background = 'rgba(0, 0, 0, 0.5)';
deathsElementEurope.style.padding = '10px';
deathsElementEurope.style.borderRadius = '5px';
deathsElementEurope.style.zIndex = '1000';
deathsElementEurope.innerText = 'Total Births: 0';
//document.body.appendChild(deathsElementEurope);



// South America
const deathsElementSouthAmerica = document.createElement('div');
deathsElementSouthAmerica.style.position = 'absolute';
deathsElementSouthAmerica.style.top = '300px';
deathsElementSouthAmerica.style.left = '20px';
deathsElementSouthAmerica.style.color = '#ffffff';
deathsElementSouthAmerica.style.fontSize = '20px';
deathsElementSouthAmerica.style.fontFamily = 'Augustus, sans-serif';
deathsElementSouthAmerica.style.background = 'rgba(0, 0, 0, 0.5)';
deathsElementSouthAmerica.style.padding = '10px';
deathsElementSouthAmerica.style.borderRadius = '5px';
deathsElementSouthAmerica.style.zIndex = '1000';
deathsElementSouthAmerica.innerText = 'Total Births: 0';
//document.body.appendChild(deathsElementSouthAmerica);


// North America
const deathsElementNorthAmerica = document.createElement('div');
deathsElementNorthAmerica.style.position = 'absolute';
deathsElementNorthAmerica.style.top = '360px';
deathsElementNorthAmerica.style.left = '20px';
deathsElementNorthAmerica.style.color = '#ffffff';
deathsElementNorthAmerica.style.fontSize = '20px';
deathsElementNorthAmerica.style.fontFamily = 'Augustus, sans-serif';
deathsElementNorthAmerica.style.background = 'rgba(0, 0, 0, 0.5)';
deathsElementNorthAmerica.style.padding = '10px';
deathsElementNorthAmerica.style.borderRadius = '5px';
deathsElementNorthAmerica.style.zIndex = '1000';
deathsElementNorthAmerica.innerText = 'Total Births: 0';
//document.body.appendChild(deathsElementNorthAmerica);



// Oceania
const deathsElementOceania = document.createElement('div');
deathsElementOceania.style.position = 'absolute';
deathsElementOceania.style.top = '420px';
deathsElementOceania.style.left = '20px';
deathsElementOceania.style.color = '#ffffff';
deathsElementOceania.style.fontSize = '20px';
deathsElementOceania.style.fontFamily = 'Augustus, sans-serif';
deathsElementOceania.style.background = 'rgba(0, 0, 0, 0.5)';
deathsElementOceania.style.padding = '10px';
deathsElementOceania.style.borderRadius = '5px';
deathsElementOceania.style.zIndex = '1000';
deathsElementOceania.innerText = 'Total Births: 0';
//document.body.appendChild(deathsElementOceania);


/**
 * Glowing Particles
 */
const particles = [];

function createGlowingParticle(position, time) {
    const particleGeometry = new THREE.BufferGeometry();
    const offset = 0.01;
    const offsetPosition = position.clone().normalize().multiplyScalar(offset);
    const finalPosition = position.clone().add(offsetPosition);

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(finalPosition.toArray(), 3));

    const particleTexture = textureLoader.load('./textures/glow-particle.png');

    const particleMaterial = new THREE.PointsMaterial({
        map: particleTexture,
        color: 0xffff99,
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
        timeToGlow: time * 1000,
        timeToFade: (time + 5) * 1000,
    });
}

function updateParticles(elapsedTime) {
    particles.forEach((particle) => {
        const timeToGlow = particle.timeToGlow / 1000;
        const timeToFade = particle.timeToFade / 1000;
        const fadeDuration = 0.2;

        if (elapsedTime >= timeToGlow && elapsedTime < timeToGlow + fadeDuration) {
            const fadeInProgress = (elapsedTime - timeToGlow) / fadeDuration;
            particle.material.opacity = THREE.MathUtils.lerp(0, 1, fadeInProgress);
        }

        if (elapsedTime >= timeToGlow + fadeDuration && elapsedTime < timeToFade - fadeDuration) {
            particle.material.opacity = 1.0;
        }

        if (elapsedTime >= timeToFade - fadeDuration && elapsedTime < timeToFade) {
            const fadeOutProgress = (timeToFade - elapsedTime) / fadeDuration;
            particle.material.opacity = THREE.MathUtils.lerp(0, 1, fadeOutProgress);
        }

        if (elapsedTime >= timeToFade) {
            particle.material.opacity = 0.0;
        }
    });
}

/**
 * Load CSV Data
 */
Papa.parse('/data/births.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: (results) => {
        results.data.forEach((row) => {
            const lon = parseFloat(row.longitude);
            const lat = parseFloat(row.latitude);
            const time = parseFloat(row.time);

            if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                const position = new THREE.Vector3();
                const latRad = THREE.MathUtils.degToRad(lat);
                const lonRad = THREE.MathUtils.degToRad(lon);
                const radius = 2;
                position.set(
                    radius * Math.cos(latRad) * Math.cos(lonRad),
                    radius * Math.sin(latRad),
                    radius * Math.cos(latRad) * Math.sin(-lonRad)
                );

                createGlowingParticle(position, time);
            }
        });
    },
});

/**
 * Add Reset Button
 */
// Create the reset button element
const resetButton = document.createElement('button');
resetButton.style.position = 'absolute';
resetButton.style.top = '1000px';
resetButton.style.left = '30px';
resetButton.style.color = '#ffffff';
resetButton.style.fontSize = '16px';
resetButton.style.fontFamily = 'Arial, sans-serif';
resetButton.style.background = '#333';
resetButton.style.padding = '10px 20px';
resetButton.style.border = 'none';
resetButton.style.borderRadius = '5px';
resetButton.style.cursor = 'pointer';
resetButton.style.zIndex = '1000';
resetButton.innerText = 'Reset day';
document.body.appendChild(resetButton);

// Reset the elapsed time when the button is clicked
resetButton.addEventListener('click', () => {
    clock.elapsedTime = 0; // Reset the elapsed time
    timerElement.innerText = 'Elapsed Time: 0.00s'; // Update the timer display
});

earth.rotation.y = 120
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    let elapsedTime = clock.getElapsedTime()

     // Stop the timer at 60 seconds
     if (elapsedTime >= 60) {
        elapsedTime = 60; 
    }

    // Update timer
    timerElement.innerText = `Elapsed Time: ${elapsedTime.toFixed(1)} minutes`;

    // Calculate Total Deaths (elapsedTime * 137 rounded to the nearest integer)
    const totalDeaths = Math.round(elapsedTime * 251.5692);
    deathsElement.innerText = `Total Births: ${totalDeaths}`;

    deathsElementAfrica.innerText = `Africa: ${Math.round(elapsedTime * 88.579302)}`;

    deathsElementAsia.innerText = `Asia: ${Math.round(elapsedTime * 124.433890)}`;

    deathsElementEurope.innerText = `Europe: ${Math.round(elapsedTime * 11.918565)}`;

    deathsElementSouthAmerica.innerText = `South America: ${Math.round(elapsedTime * 17.684384)}`;

    deathsElementNorthAmerica.innerText = `North America: ${Math.round(elapsedTime * 7.631918)}`;

    deathsElementOceania.innerText = `Oceania: ${Math.round(elapsedTime * 1.321191)}`;

    // Update particles
    if (elapsedTime != 60){
        updateParticles(elapsedTime);
    }
    

    // Rotate earth
    earth.rotation.y += 0.0001;

    // Update controls and render
    controls.update();
    renderer.render(scene, camera);

    // Call next frame
    window.requestAnimationFrame(tick);
};


tick();
