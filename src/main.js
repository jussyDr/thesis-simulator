import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { Simulation } from './simulation';
import { TrainingBasedModulation } from './modulation/training-based';
import { SemiBlindModulation } from './modulation/semi-blind';

// GUI parameters

var params = {
    noise: 0,
    frequency: 100,
    rotationSpeed: 1,
    distance: 2.5,

    modulation: undefined,
    maxSymbolsPerFrame: 100,
    shortPreamble: true,
};

const modulations = {
    'training based': new TrainingBasedModulation(params),
    'semi blind': new SemiBlindModulation(params)
};

params.modulation = modulations["semi blind"];

// Initialize renderer

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize);

// Initialize simulation

const simulation = new Simulation(renderer, params);

// Initialize GUI

const gui = new GUI();

gui.add(params, 'noise', 0).onChange(() => { simulation.resetModulation() });
gui.add(params, 'frequency', 0).onChange(() => { simulation.resetModulation() });
gui.add(params, 'rotationSpeed', 0).onChange(() => { simulation.resetModulation() });
gui.add(params, "distance", 0).onChange((distance) => { simulation.setDistance(distance); simulation.resetModulation() });

gui.add(params, "modulation", modulations).onChange((modulation) => { modulation.reset() });
gui.add(params, "maxSymbolsPerFrame", 0).onChange(() => { simulation.resetModulation() });
gui.add(params, "shortPreamble").onChange(() => { simulation.resetModulation() });

gui.open();

// Run simulation

renderer.setAnimationLoop(render);

function render() {
    simulation.render(renderer);
}

function onWindowResize() {
    simulation.onWindowResize();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
