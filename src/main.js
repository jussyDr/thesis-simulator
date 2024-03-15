import * as math from 'mathjs';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Simulation {
    clock;
    timeAccumulator;
    transmitterPeriod;

    modulation;

    scene;
    camera;
    lightSource;
    lightSourceHelper;
    transmitterMesh;

    constructor(renderer, transmitterFrequency = 100, modulation = new BasicModulation()) {
        this.clock = new THREE.Clock()
        this.timeAccumulator = 0;
        this.transmitterPeriod = 1 / transmitterFrequency;

        this.modulation = modulation;

        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(7, 4, 1);

        const controls = new OrbitControls(this.camera, renderer.domElement);
        controls.minDistance = 2;
        controls.maxDistance = 10;
        controls.maxPolarAngle = Math.PI / 2;
        controls.target.set(0, 1, 0);
        controls.update();

        const geometry = new THREE.PlaneGeometry(200, 200);
        const material = new THREE.MeshLambertMaterial({ color: 0xbcbcbc });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        this.lightSource = new THREE.SpotLight(0xffffff, 100);

        this.lightSource.position.set(0, 2.5, 0);
        this.lightSource.angle = Math.PI / 6;
        this.lightSource.penumbra = 1;
        this.lightSource.decay = 2;
        this.lightSource.distance = 0;

        this.lightSource.castShadow = true;
        this.lightSource.shadow.mapSize.width = 1024;
        this.lightSource.shadow.mapSize.height = 1024;
        this.lightSource.shadow.camera.near = 1;
        this.lightSource.shadow.camera.far = 10;
        this.lightSource.shadow.focus = 1;

        this.scene.add(this.lightSource);

        this.lightSourceHelper = new THREE.SpotLightHelper(this.lightSource);
        this.scene.add(this.lightSourceHelper);

        const transmitterGeometry = new THREE.BoxGeometry(1, 0.1, 1);
        const transmitterMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        this.transmitterMesh = new THREE.Mesh(transmitterGeometry, transmitterMaterial);
        this.transmitterMesh.castShadow = true;
        this.transmitterMesh.receiveShadow = true;
        this.scene.add(this.transmitterMesh);
    }

    update() {
        this.transmitterMesh.rotation.y += this.transmitterPeriod;

        const symbol = this.modulation.nextSymbol();
        const channelMatrix = math.matrix([[1, 0.25, 0.25], [0.25, 1, 0.25], [0.25, 0.25, 1]]);
        const signal = math.multiply(symbol, channelMatrix);

        this.modulation.update(signal);
    }

    render(renderer) {
        this.timeAccumulator += this.clock.getDelta();

        while (this.timeAccumulator >= this.transmitterPeriod) {
            this.update();
            this.timeAccumulator -= this.transmitterPeriod;
        }

        renderer.render(this.scene, this.camera);
    }
}

class BasicModulation {
    maxSymbolsPerFrame;

    symbolQueue;
    sendingPreamble;

    channelMatrixEstimate;
    channelMatrixEstimateIndex;

    constructor(maxSymbolsPerFrame = 100) {
        this.maxSymbolsPerFrame = maxSymbolsPerFrame;

        this.symbolQueue = [];
        this.sendingPreamble = false;

        this.channelMatrixEstimate = math.zeros(3, 3)
        this.channelMatrixEstimateIndex = 0;
    }

    nextSymbol() {
        if (this.symbolQueue.length == 0) {
            if (this.sendingPreamble) {
                for (let i = 0; i < this.maxSymbolsPerFrame; i++) {
                    this.symbolQueue.push(math.randomInt([3], 0, 2));
                }
            } else {
                this.symbolQueue.push(math.matrix([1, 0, 0]));
                this.symbolQueue.push(math.matrix([0, 1, 0]));
                this.symbolQueue.push(math.matrix([0, 0, 1]));
            }

            this.sendingPreamble = !this.sendingPreamble;
        }

        return this.symbolQueue.shift();
    }

    update(signal) {
        if (this.sendingPreamble) {
            this.channelMatrixEstimate.subset(math.index(this.channelMatrixEstimateIndex, [0, 1, 2]), signal);
            this.channelMatrixEstimateIndex = (this.channelMatrixEstimateIndex + 1) % 3;
        } else {
            const estimatedSymbol = math.multiply(math.inv(this.channelMatrixEstimate), signal);
        }
    }
}

// Initialize renderer

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// Initialize simulation

const simulation = new Simulation(renderer);

// Run simulation

renderer.setAnimationLoop(render);

function render() {
    simulation.render(renderer);
}
