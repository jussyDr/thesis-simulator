import * as math from 'mathjs';

import * as THREE from 'three';

import { Simulation } from './simulation';


// Initialize renderer

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize);

// Initialize simulation

const simulation = new Simulation(renderer);

// Run simulation

renderer.setAnimationLoop(render);

function render() {
    simulation.render(renderer);
}

function onWindowResize() {
    simulation.onWindowResize();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
