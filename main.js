import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let clock, renderer, scene, camera;

let transmitter, spotLight, lightHelper;

init();

function init() {
    clock = new THREE.Clock()

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    renderer.setAnimationLoop(render);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(7, 4, 1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 1, 0);
    controls.update();

    const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.15);
    scene.add(ambient);

    spotLight = new THREE.SpotLight(0xffffff, 100);
    spotLight.position.set(0, 2, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 1;
    spotLight.decay = 2;
    spotLight.distance = 0;

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 10;
    spotLight.shadow.focus = 1;
    scene.add(spotLight);

    lightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(lightHelper);

    //

    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.MeshLambertMaterial({ color: 0xbcbcbc });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, - 1, 0);
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    //

    const transmitterGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const transmitterMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    transmitter = new THREE.Mesh(transmitterGeometry, transmitterMaterial);
    transmitter.castShadow = true;
    transmitter.receiveShadow = true;
    scene.add(transmitter);

    window.addEventListener('resize', onWindowResize);

    // GUI

    const gui = new GUI();

    const params = {
        color: spotLight.color.getHex(),
        intensity: spotLight.intensity,
        distance: spotLight.distance,
        angle: spotLight.angle,
        penumbra: spotLight.penumbra,
        decay: spotLight.decay,
        focus: spotLight.shadow.focus,
        shadows: true
    };

    gui.addColor(params, 'color').onChange(function (val) {
        spotLight.color.setHex(val);
    });

    gui.add(params, 'intensity', 0, 500).onChange(function (val) {
        spotLight.intensity = val;
    });

    gui.add(params, 'distance', 0, 20).onChange(function (val) {
        spotLight.distance = val;
    });

    gui.add(params, 'angle', 0, Math.PI / 3).onChange(function (val) {
        spotLight.angle = val;
    });

    gui.add(params, 'penumbra', 0, 1).onChange(function (val) {
        spotLight.penumbra = val;
    });

    gui.add(params, 'decay', 1, 2).onChange(function (val) {
        spotLight.decay = val;
    });

    gui.add(params, 'focus', 0, 1).onChange(function (val) {
        spotLight.shadow.focus = val;
    });

    gui.add(params, 'shadows').onChange(function (val) {
        renderer.shadowMap.enabled = val;

        scene.traverse(function (child) {
            if (child.material) {

                child.material.needsUpdate = true;

            }
        });
    });

    gui.open();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    const delta = clock.getDelta()

    lightHelper.update();

    transmitter.rotation.y += 1 * delta;

    renderer.render(scene, camera);
}
