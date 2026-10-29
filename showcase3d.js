// AOKTAC 3D showcase: a PET bottle that grows through the published TEC BLOW
// container envelopes, beside the machine that blows it. One renderer, two studio viewports.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const N = 220;          // profile samples, shared by every bottle so shapes can morph
const SEG = 128;        // radial segments
const MM = 0.01;        // world units per millimetre

// Bottle families sized to each machine's published maximum container (diameter x height, mm).
export const BOTTLES = [
  { H: 250, D: 65, neck: 28, ring: 34, kind: "water", cap: 0x1d5fae },   // RL-12, 0.6 L
  { H: 320, D: 95, neck: 28, ring: 34, kind: "csd", cap: 0xc8252c },     // RL-6II, 2 L
  { H: 360, D: 180, neck: 48, ring: 56, kind: "jug", cap: 0xeef1f4 },    // RL-4-5L, 5 L
  { H: 550, D: 300, neck: 55, ring: 66, kind: "barrel", cap: 0x1d5fae }, // RL-2-20L, 20 L
  { H: 600, D: 290, neck: 55, ring: 66, kind: "barrel", cap: 0x1d5fae }, // RL-1-30L, 30 L
];

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const neckLenOf = (b) => (b.kind === "barrel" ? 0.1 : b.kind === "jug" ? 0.11 : 0.09);

// Radius (mm) at normalised height t (0 = base, 1 = top of neck), before radial modulation.
function profile(b, t) {
  const R = b.D / 2, nr = b.neck / 2, rr = b.ring / 2;
  const ringAt = 1 - neckLenOf(b);
  const shoulderEnd = b.kind === "csd" ? 0.62 : b.kind === "jug" ? 0.72 : b.kind === "barrel" ? 0.8 : 0.7;
  if (t >= ringAt + 0.012) {
    const thread = (t > ringAt + 0.03 && t < 0.985) ? 1.1 * Math.max(0, Math.sin((t - ringAt) * 260)) : 0;
    return nr + thread;
  }
  if (t >= ringAt - 0.012) return rr - Math.pow((t - ringAt) / 0.012, 4) * 0.6;   // support ring, softened edge
  if (t >= shoulderEnd) {
    const s = (ringAt - 0.012 - t) / (ringAt - 0.012 - shoulderEnd);
    const k = (b.kind === "water" || b.kind === "csd") ? smooth(0, 1, s) : Math.sqrt(Math.max(0, 1 - Math.pow(1 - s, 2)));
    return nr * 1.04 + (R - nr * 1.04) * k;
  }
  let r = R;
  if (b.kind === "water") r -= 2.2 * Math.exp(-Math.pow((t - 0.42) / 0.02, 2)) + 2.2 * Math.exp(-Math.pow((t - 0.5) / 0.02, 2));
  if (b.kind === "csd") r -= 0.8 * Math.exp(-Math.pow((t - 0.56) / 0.012, 2));
  if (b.kind === "jug") r -= 3 * Math.exp(-Math.pow((t - 0.5) / 0.03, 2));
  if (b.kind === "barrel") r -= 4 * Math.exp(-Math.pow((t - 0.33) / 0.025, 2)) + 4 * Math.exp(-Math.pow((t - 0.55) / 0.025, 2));
  const base = b.kind === "barrel" ? 0.07 : 0.09;
  if (t < base) r *= 0.55 + 0.45 * Math.sqrt(1 - Math.pow(1 - t / base, 2));
  return r;
}
const petal = (b, t) => (b.kind === "water" || b.kind === "csd") && t < 0.06 ? (1 - t / 0.06) * 0.12 : 0;

function sampleBottle(b) {
  const out = new Float32Array(N * 3); // r, y, petaloid strength
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    out[i * 3] = profile(b, t) * MM;
    out[i * 3 + 1] = t * b.H * MM;
    out[i * 3 + 2] = petal(b, t);
  }
  return out;
}

function makeLathe() {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(N * (SEG + 1) * 3);
  const idx = [];
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < SEG; j++) {
    const a = i * (SEG + 1) + j, b2 = a + SEG + 1;
    idx.push(a, b2, a + 1, b2, b2 + 1, a + 1);
  }
  g.setIndex(idx);
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return g;
}
function writeLathe(g, prof) {
  const p = g.attributes.position.array;
  let k = 0;
  for (let i = 0; i < N; i++) {
    const r = prof[i * 3], y = prof[i * 3 + 1], pe = prof[i * 3 + 2];
    for (let j = 0; j <= SEG; j++) {
      const th = (j / SEG) * Math.PI * 2;
      const rr = r * (1 - pe + pe * (0.55 + 0.45 * Math.cos(5 * th)));
      p[k++] = Math.cos(th) * rr; p[k++] = y; p[k++] = Math.sin(th) * rr;
    }
  }
  g.attributes.position.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
}

// Ribbed screw cap, unit radius and height; scaled to the neck per frame.
function makeCap() {
  const pts = [
    new THREE.Vector2(0.0, 1), new THREE.Vector2(0.9, 1), new THREE.Vector2(1, 0.94),
    new THREE.Vector2(1, 0.08), new THREE.Vector2(0.97, 0), new THREE.Vector2(0.86, 0),
  ];
  const g = new THREE.LatheGeometry(pts, 96);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
    if (Math.hypot(x, z) > 0.95 && y > 0.1 && y < 0.92) {     // knurled grip ribs
      const k = 1 + 0.025 * Math.max(0, Math.cos(Math.atan2(z, x) * 36));
      p.setX(i, x * k); p.setZ(i, z * k);
    }
  }
  g.computeVertexNormals();
  return g;
}

// Studio sweep: canvas row 0 maps to the top of the sphere. Bright wall, soft horizon, cooler floor.
function sweepTexture(top, bottom) {
  const c = document.createElement("canvas"); c.width = 4; c.height = 512;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, top); g.addColorStop(0.47, top); g.addColorStop(0.53, bottom); g.addColorStop(1, bottom);
  x.fillStyle = g; x.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function blobTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d");
  const gr = x.createRadialGradient(128, 128, 6, 128, 128, 126);
  gr.addColorStop(0, "rgba(11,30,51,.4)"); gr.addColorStop(0.45, "rgba(11,30,51,.13)"); gr.addColorStop(1, "rgba(11,30,51,0)");
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// Product-photography studio used as the environment map: a dark room with large softboxes.
// The softboxes draw clean highlights along clear PET and across the white machine panels.
function studioEnvironment(renderer) {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: 0x2a3340, side: THREE.BackSide }));
  room.position.y = 4; scene.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: 0x5c6773 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.99; scene.add(floor);
  const box = (w, h, x, y, z, ry, rx, v) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v * 1.02), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); scene.add(m);
  };
  box(6, 4, -6, 5, 3, Math.PI / 2.6, -0.4, 6);     // key softbox, upper left
  box(1.6, 9, 7.5, 3, -1, -Math.PI / 2.2, 0, 4.5); // tall strip, right rim
  box(1.6, 9, -7.5, 3, -3, Math.PI / 2.2, 0, 2.2); // fill strip, left rim
  box(10, 3, 0, 9.5, 0, 0, Math.PI / 2, 2.6);      // overhead
  box(8, 4, 0, 3, -9.5, 0, 0, 1.4);                // back wall bounce
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  return env;
}

// Each viewport is a small photo studio: graded backdrop, soft key shadow, contact shadow.
function makeStudioScene(env, top, bottom) {
  const scene = new THREE.Scene();
  scene.environment = env;
  // Real geometry behind the subject, so clear PET has something to refract.
  const sweep = new THREE.Mesh(new THREE.SphereGeometry(40, 64, 64), new THREE.MeshBasicMaterial({ map: sweepTexture(top, bottom), side: THREE.BackSide, toneMapped: false, depthWrite: false }));
  sweep.position.y = 2;
  scene.add(sweep);
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-3.5, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 8;
  key.shadow.blurSamples = 16;
  key.shadow.bias = -0.0005;
  key.shadow.camera.far = 30;
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d2da, 0.55));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ color: 0x0b1e33, opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  scene.add(floor);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.002;
  scene.add(blob);
  return { scene, key, blob };
}

export function createShowcase({ canvas, bottleSlot, machineSlot, lowPower, reduced, machines }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.setScissorTest(true);
  if ("transmissionResolutionScale" in renderer) renderer.transmissionResolutionScale = lowPower ? 0.6 : 1;

  const env = studioEnvironment(renderer);

  // Bottle studio
  const B = makeStudioScene(env, "#f1f4f7", "#cfd8e0");
  Object.assign(B.key.shadow.camera, { left: -4, right: 4, top: 8, bottom: -2 });
  const bCam = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  const profiles = BOTTLES.map(sampleBottle);
  const blend = new Float32Array(N * 3);
  const geo = makeLathe();
  // Clear PET with real refraction through the wall; thin-walled so the far side stays visible.
  const pet = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.02, ior: 1.57, transmission: 1, thickness: 0.025,
    attenuationColor: new THREE.Color(0x9fcdee), attenuationDistance: 2.2,
    specularIntensity: 1, clearcoat: 0.5, clearcoatRoughness: 0.02, envMapIntensity: 1.6,
    side: THREE.DoubleSide,
  });
  const bottle = new THREE.Mesh(geo, pet);
  bottle.castShadow = true;
  const capMat = new THREE.MeshPhysicalMaterial({ color: 0x1d5fae, roughness: 0.38, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 0.9 });
  const cap = new THREE.Mesh(makeCap(), capMat);
  cap.castShadow = true;
  const bGroup = new THREE.Group(); bGroup.add(bottle, cap); B.scene.add(bGroup);

  // Machine studio
  const M = makeStudioScene(env, "#edf1f4", "#c9d2db");
  M.key.intensity = 2.6;
  Object.assign(M.key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
  const mCam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const machineGroups = machines.map(() => { const g = new THREE.Group(); M.scene.add(g); return g; });
  const loaded = machines.map(() => false);

  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  function loadMachine(i) {
    if (loaded[i] !== false) return;
    loaded[i] = "loading";
    loader.load(machines[i].src, (gltf) => {
      const obj = gltf.scene;
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      const s = 3 / Math.max(size.x, size.y, size.z);
      obj.scale.setScalar(s);
      obj.position.set(-c.x * s, -box.min.y * s, -c.z * s);
      obj.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true; o.receiveShadow = true;
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          m.envMapIntensity = 0.85;
          for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap"]) if (m[k]) m[k].anisotropy = maxAniso;
          m.needsUpdate = true;
        }
      });
      machineGroups[i].add(obj);
      machineGroups[i].userData.size = size.multiplyScalar(s);
      loaded[i] = true;
      machines[i].onLoad?.();
    }, undefined, () => { loaded[i] = "failed"; machines[i].onError?.(); });
  }

  const state = { stage: 0, machine: 0, mix: 1, px: 0, py: 0, tx: 0, ty: 0, visible: false, t: 0 };

  function rectOf(el) {
    const r = el.getBoundingClientRect(), c = canvas.getBoundingClientRect();
    return { x: r.left - c.left, y: c.bottom - r.bottom, w: r.width, h: r.height };
  }
  function resize() { renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); }
  window.addEventListener("resize", resize);
  resize();

  function setStage(s) { state.stage = s; }
  function setPointer(x, y) { state.tx = x; state.ty = y; }
  function setVisible(v) { state.visible = v; if (v) machines.forEach((_, i) => loadMachine(i)); }

  const cA = new THREE.Color(), cB = new THREE.Color();
  let lastShape = -1;
  function frame(dt) {
    if (!state.visible) return;
    if (!reduced) state.t += dt;
    state.px += (state.tx - state.px) * (1 - Math.exp(-dt * 4));
    state.py += (state.ty - state.py) * (1 - Math.exp(-dt * 4));

    // Bottle morph between the two neighbouring published envelopes
    if (Math.abs(state.stage - lastShape) > 1e-4) {
      const i = Math.min(BOTTLES.length - 2, Math.floor(state.stage));
      const f = smooth(0.12, 0.88, state.stage - i);
      const bi = BOTTLES[i], bj = BOTTLES[i + 1];
      const a = profiles[i], b = profiles[i + 1];
      for (let k = 0; k < blend.length; k++) blend[k] = a[k] + (b[k] - a[k]) * f;
      writeLathe(geo, blend);
      lastShape = state.stage;
      const lerp = (x, y) => x + (y - x) * f;
      const H = lerp(bi.H, bj.H) * MM, nr = (lerp(bi.neck, bj.neck) / 2) * MM;
      const capH = Math.max(0.12, nr * 1.25);
      cap.scale.set(nr * 1.16, capH, nr * 1.16);
      cap.position.y = H - capH * 0.92;
      capMat.color.copy(cA.setHex(bi.cap)).lerp(cB.setHex(bj.cap), f);
      const D = lerp(bi.D, bj.D) * MM;
      B.blob.scale.set(D * 2.4, D * 2.4, 1);
    }
    bGroup.rotation.y = 0.35 + state.t * 0.22 + state.px * 0.6;
    bGroup.rotation.x = state.py * 0.06;

    // Camera frames the tallest container so growth reads at true relative scale.
    const bRect = rectOf(bottleSlot);
    bCam.aspect = bRect.w / Math.max(1, bRect.h);
    const dist = (7.4 / 2) / Math.tan(THREE.MathUtils.degToRad(bCam.fov / 2)) * (bCam.aspect < 0.75 ? 1.15 : 1);
    bCam.position.set(0, 3.6, dist); bCam.lookAt(0, 3.05, 0);
    bCam.updateProjectionMatrix();

    // Machine: compact range for small bottles, large-container machine from 5 L.
    const want = state.stage < 1.5 ? 0 : 1;
    if (want !== state.machine) { state.machine = want; state.mix = reduced ? 1 : 0; }
    state.mix = Math.min(1, state.mix + dt * 2.2);
    machineGroups.forEach((g, gi) => {
      const k = gi === state.machine ? smooth(0, 1, state.mix) : 1 - smooth(0, 1, state.mix);
      g.visible = k > 0.02 && loaded[gi] === true;
      g.scale.setScalar(0.9 + 0.1 * k);
      g.position.y = (1 - k) * -0.2;
      g.rotation.y = -0.55 + (machines[gi].yaw || 0) + state.px * 0.45 + Math.sin(state.t * 0.2) * 0.04;
    });
    const active = machineGroups[state.machine].userData.size;
    if (active) M.blob.scale.set(active.x * 1.6, active.z * 2.4, 1);
    const mRect = rectOf(machineSlot);
    mCam.aspect = mRect.w / Math.max(1, mRect.h);
    const big = state.machine === 1;
    const mDist = (mCam.aspect < 1 ? 7.4 : 5.6) * (big ? 1.12 : 1);
    mCam.position.set(Math.sin(state.px * 0.15) * 0.4, 1.7 + state.py * 0.25, mDist);
    mCam.lookAt(0, big ? 0.72 : 0.95, 0);
    mCam.updateProjectionMatrix();

    renderer.setScissor(0, 0, canvas.width, canvas.height);
    renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    for (const [scene, cam, r] of [[B.scene, bCam, bRect], [M.scene, mCam, mRect]]) {
      if (r.w < 2 || r.h < 2) continue;
      renderer.setViewport(r.x, r.y, r.w, r.h);
      renderer.setScissor(r.x, r.y, r.w, r.h);
      renderer.render(scene, cam);
    }
  }

  return { setStage, setPointer, setVisible, frame, resize, loaded };
}
