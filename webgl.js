// Lightweight Three.js scene for a stylized ice-cream bar with shader rim + floating animation
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const isTouch = window.matchMedia('(pointer: coarse)').matches;
const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage = document.getElementById('webglStage');
let renderer, scene, camera, popsicleGroup, clock;

if (!(isTouch || prefersReduce || !stage)) {
  init();
  animate();
}

function init() {
  const { clientWidth: w, clientHeight: h } = stage;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.outputEncoding = THREE.sRGBEncoding;
  stage.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
  camera.position.set(0.6, 0.4, 5);

  const hemi = new THREE.HemisphereLight(0xff8f5a, 0x1c0a04, 0.9);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(3, 6, 4);
  scene.add(dir);

  popsicleGroup = new THREE.Group();
  scene.add(popsicleGroup);

  addPopsicle();
  addStick();
  addNuts();

  clock = new THREE.Clock();
  window.addEventListener('resize', onResize);
}

function addPopsicle() {
  const geom = new THREE.CapsuleGeometry(0.9, 1.6, 24, 36);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0x6b321f) },
      uColorB: { value: new THREE.Color(0xb85b36) },
      uRim: { value: new THREE.Color(0xffc46d) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uRim;
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        float wave = sin(uTime * 0.8 + vPos.y * 2.5) * 0.5 + 0.5;
        vec3 base = mix(uColorA, uColorB, wave);
        float fresnel = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
        vec3 color = mix(base, uRim, fresnel * 1.1);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    flatShading: false
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = 0.4;
  popsicleGroup.add(mesh);
  popsicleGroup.userData.shader = material;
}

function addStick() {
  const stickGeom = new THREE.CylinderGeometry(0.18, 0.2, 1.2, 24);
  const stickMat = new THREE.MeshStandardMaterial({
    color: 0xe2b07a,
    roughness: 0.5,
    metalness: 0.05
  });
  const stick = new THREE.Mesh(stickGeom, stickMat);
  stick.position.y = -1.25;
  popsicleGroup.add(stick);
}

function addNuts() {
  const nutGeom = new THREE.SphereGeometry(0.08, 8, 8);
  const nutMat = new THREE.MeshStandardMaterial({ color: 0xffd38a, roughness: 0.3, metalness: 0.2 });
  const nutCount = 90;
  const nutMesh = new THREE.InstancedMesh(nutGeom, nutMat, nutCount);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < nutCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const v = Math.random() * 0.85 - 0.25; // vertical spread
    const r = 0.9 + Math.random() * 0.02;
    dummy.position.set(Math.cos(theta) * r, v + 0.4, Math.sin(theta) * r);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.updateMatrix();
    nutMesh.setMatrixAt(i, dummy.matrix);
  }
  nutMesh.instanceMatrix.needsUpdate = true;
  popsicleGroup.add(nutMesh);
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (popsicleGroup) {
    popsicleGroup.rotation.y = t * 0.35;
    popsicleGroup.rotation.x = Math.sin(t * 0.6) * 0.08;
    popsicleGroup.position.y = Math.sin(t * 0.9) * 0.08;
    const mat = popsicleGroup.userData.shader;
    if (mat) mat.uniforms.uTime.value = t;
  }

  renderer.render(scene, camera);
}

function onResize() {
  const { clientWidth: w, clientHeight: h } = stage;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
