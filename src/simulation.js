export { Simulation };

import * as math from 'mathjs';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

import { BasicModulation } from './modulation/basic.js';

class Simulation {
    params;

    clock;
    timeAccumulator;

    modulation;

    scene;
    camera;
    lightSource;
    lightSourceHelper;
    transmitterMesh;

    constructor(renderer, params, modulation = new BasicModulation()) {
        this.params = params;

        this.clock = new THREE.Clock()
        this.timeAccumulator = 0;

        this.modulation = modulation;

        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(7, 4, 1);

        const orbitControls = new OrbitControls(this.camera, renderer.domElement);
        orbitControls.minDistance = 2;
        orbitControls.maxDistance = 10;
        orbitControls.maxPolarAngle = Math.PI / 2;
        orbitControls.target.set(0, 1, 0);
        orbitControls.update();

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

        const dragControls = new DragControls([], this.camera, renderer.domElement);

        dragControls.addEventListener('dragstart', function () { orbitControls.enabled = false; });
        dragControls.addEventListener('dragend', function () { orbitControls.enabled = true; });
    }

    update() {
        this.transmitterMesh.rotateY((1 / this.params.frequency) * this.params.rotationSpeed);

        this.updateModulation();
    }

    updateModulation() {
        const symbol = this.modulation.nextSymbol();

        const [x1, lightSourceAngle] = toAxisAngle(this.lightSource.rotation);
        const [x2, transmitterAngle] = toAxisAngle(this.transmitterMesh.rotation);
        const todo = x1.dot(x2);

        const angleDifference = lightSourceAngle - transmitterAngle;
        const a = Math.cos(angleDifference) ** 2;
        const b = Math.cos(angleDifference + Math.PI / 3) ** 2;
        const c = Math.cos(angleDifference + (Math.PI / 3) * 2) ** 2;

        const channelMatrix = math.matrix([[a, b, c], [c, a, b], [b, c, a]]);
        const signal = math.multiply(symbol, channelMatrix);

        this.modulation.update(signal);

        document.getElementById('ber').innerText = "BER: " + (this.modulation.bitErrorRate() * 100).toFixed(2) + "%";
        document.getElementById('dr').innerText = "UTIL: " + (this.modulation.dataRate() * 100).toFixed(2) + "%";
    }

    render(renderer) {
        this.timeAccumulator += this.clock.getDelta();

        while (this.timeAccumulator >= (1 / this.params.frequency)) {
            this.update();
            this.timeAccumulator -= 1 / this.params.frequency;
        }

        renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    resetModulation() {
        this.modulation.reset();
    }
}

function toAxisAngle(euler) {
    const quaternion = new THREE.Quaternion().setFromEuler(euler);

    const angle = 2 * Math.acos(quaternion.w);

    const s = Math.sqrt(1 - quaternion.w * quaternion.w);

    if (s == 0) {
        return [new THREE.Vector3(0, 1, 0), 0];
    }

    const x = quaternion.x / s;
    const y = quaternion.y / s;
    const z = quaternion.z / s;

    const axis = new THREE.Vector3(x, y, z);

    return [axis, angle];
}
