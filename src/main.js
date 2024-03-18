import * as THREE from 'three';

import { Simulation } from './simulation';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

var params = {
    frequency: 100,
    rotationSpeed: 0.1,
};

// Initialize renderer

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize);

// Initialize GUI

const gui = new GUI();

gui.add(params, 'frequency', 0);
gui.add(params, 'rotationSpeed', 0);

gui.open();

// Initialize simulation

const simulation = new Simulation(renderer, params);

// Run simulation

renderer.setAnimationLoop(render);

function render() {
    simulation.render(renderer);
}

function onWindowResize() {
    simulation.onWindowResize();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
