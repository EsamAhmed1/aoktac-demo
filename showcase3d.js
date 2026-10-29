// AOKTAC 3D showcase: a PET bottle that grows through the published TEC BLOW
// container envelopes, beside the machine that blows it. One renderer, two viewports.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const N = 150;          // profile samples, shared by every bottle so shapes can morph
const SEG = 96;         // radial segments
const MM = 0.01;        // world units per millimetre

// Bottle families sized to each machine's published maximum container (diameter x height, mm).
export const BOTTLES = [
  { H: 250, D: 65, neck: 28, ring: 34, kind: "water" },   // RL-12, 0.6 L
  { H: 320, D: 95, neck: 28, ring: 34, kind: "csd" },     // RL-6II, 2 L
  { H: 360, D: 180, neck: 48, ring: 56, kind: "jug" },    // RL-4-5L, 5 L
  { H: 550, D: 300, neck: 55, ring: 66, kind: "barrel" }, // RL-2-20L, 20 L
  { H: 600, D: 290, neck: 55, ring: 66, kind: "barrel" }, // RL-1-30L, 30 L
];

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Radius (mm) at normalised height t (0 = base, 1 = top of neck), before radial modulation.
function profile(b, t) {
  const R = b.D / 2, nr = b.neck / 2, rr = b.ring / 2;
  const neckLen = b.kind === "barrel" ? 0.1 : b.kind === "jug" ? 0.11 : 0.09;
  const ringAt = 1 - neckLen;
  const shoulderEnd = b.kind === "csd" ? 0.62 : b.kind === "jug" ? 0.72 : b.kind === "barrel" ? 0.8 : 0.7;
  if (t >= ringAt + 0.012) {
    const thread = (t > ringAt + 0.03 && t < 0.985) ? 1.1 * Math.max(0, Math.sin((t - ringAt) * 260)) : 0;
    return nr + thread;
  }
  if (t >= ringAt - 0.012) return rr;                               // support ring
  if (t >= shoulderEnd) {                                           // shoulder
    // s = 0 just under the support ring, 1 where the shoulder meets the body
    const s = (ringAt - 0.012 - t) / (ringAt - 0.012 - shoulderEnd);
    const k = (b.kind === "water" || b.kind === "csd")
      ? smooth(0, 1, s)
      : Math.sqrt(Math.max(0, 1 - Math.pow(1 - s, 2)));             // domed shoulder
    return nr * 1.04 + (R - nr * 1.04) * k;
  }
  let r = R;
  if (b.kind === "water") {                                         // two grip grooves
    r -= 2.2 * Math.exp(-Math.pow((t - 0.42) / 0.02, 2)) + 2.2 * Math.exp(-Math.pow((t - 0.5) / 0.02, 2));
  }
  if (b.kind === "barrel") {                                        // stiffening ribs
    r -= 4 * Math.exp(-Math.pow((t - 0.33) / 0.025, 2)) + 4 * Math.exp(-Math.pow((t - 0.55) / 0.025, 2));
  }
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

function shadowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d");
  const gr = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, "rgba(11,30,51,.34)"); gr.addColorStop(1, "rgba(11,30,51,0)");
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function createShowcase({ canvas, bottleSlot, machineSlot, lowPower, reduced, machines }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: true, powerPreference: lowPower ? "low-power" : "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.25 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setScissorTest(true);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // Bottle scene
  const bScene = new THREE.Scene(); bScene.environment = env;
  const bCam = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const profiles = BOTTLES.map(sampleBottle);
  const blend = new Float32Array(N * 3);
  const geo = makeLathe();
  // Clear PET: a faint back shell plus a glossy front shell. Reads as plastic on a light ground
  // without relying on transmission buffers.
  const pet = { color: 0x5f9fd0, roughness: 0.03, metalness: 0, ior: 1.57, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, transparent: true, depthWrite: false };
  // Edge-weighted alpha: clear through the middle, denser at grazing angles, like real PET.
  const fresnel = (lo, hi) => (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>",
      `float fres = pow(1.0 - clamp(abs(dot(normalize(geometryNormal), normalize(geometryViewDir))), 0.0, 1.0), 2.2);
       diffuseColor.a = mix(${lo.toFixed(3)}, ${hi.toFixed(3)}, fres);
       #include <opaque_fragment>`);
  };
  const backMat = new THREE.MeshPhysicalMaterial({ ...pet, side: THREE.BackSide, envMapIntensity: 1.0 });
  backMat.onBeforeCompile = fresnel(0.04, 0.35);
  const frontMat = new THREE.MeshPhysicalMaterial({ ...pet, side: THREE.FrontSide, envMapIntensity: 2.6 });
  frontMat.onBeforeCompile = fresnel(lowPower ? 0.14 : 0.11, 0.86);
  const back = new THREE.Mesh(geo, backMat);
  const front = new THREE.Mesh(geo, frontMat);
  back.renderOrder = 1; front.renderOrder = 2;
  const bGroup = new THREE.Group(); bGroup.add(back, front); bScene.add(bGroup);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; bScene.add(sh);
  // A thin steel plinth line gives the bottle a floor to stand on.
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 6, 4); bScene.add(key);

  // Machine scene
  const mScene = new THREE.Scene(); mScene.environment = env;
  const mCam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  mScene.add(new THREE.HemisphereLight(0xffffff, 0xdfe6ec, 1.4));
  const mKey = new THREE.DirectionalLight(0xffffff, 1.6); mKey.position.set(4, 8, 6); mScene.add(mKey);
  const mShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  mShadow.rotation.x = -Math.PI / 2; mScene.add(mShadow);
  const machineGroups = machines.map(() => { const g = new THREE.Group(); mScene.add(g); return g; });
  const loaded = machines.map(() => false);

  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
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
      obj.traverse((o) => { if (o.isMesh && o.material) { o.material.envMapIntensity = 1; } });
      machineGroups[i].add(obj);
      machineGroups[i].userData.size = size.multiplyScalar(s);
      loaded[i] = true;
      state.dirty = true;
      machines[i].onLoad?.();
    }, undefined, () => { loaded[i] = "failed"; machines[i].onError?.(); });
  }

  const state = { stage: 0, machine: 0, mix: 1, px: 0, py: 0, tx: 0, ty: 0, dirty: true, visible: false, t: 0 };

  function rectOf(el) {
    const r = el.getBoundingClientRect(), c = canvas.getBoundingClientRect();
    return { x: r.left - c.left, y: c.bottom - r.bottom, w: r.width, h: r.height };
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    state.dirty = true;
  }
  window.addEventListener("resize", resize);
  resize();

  // stage is a float 0..BOTTLES.length-1
  function setStage(s) { if (Math.abs(s - state.stage) > 1e-4) { state.stage = s; state.dirty = true; } }
  function setPointer(x, y) { state.tx = x; state.ty = y; }
  function setVisible(v) { state.visible = v; if (v) { machines.forEach((_, i) => loadMachine(i)); } }

  let lastShape = -1;
  function frame(dt) {
    if (!state.visible) return;
    if (!reduced) state.t += dt;
    state.px += (state.tx - state.px) * (1 - Math.exp(-dt * 4));
    state.py += (state.ty - state.py) * (1 - Math.exp(-dt * 4));

    // Bottle morph
    if (Math.abs(state.stage - lastShape) > 1e-4) {
      const i = Math.min(BOTTLES.length - 2, Math.floor(state.stage));
      const f = smooth(0.12, 0.88, state.stage - i);
      const a = profiles[i], b = profiles[i + 1];
      for (let k = 0; k < blend.length; k++) blend[k] = a[k] + (b[k] - a[k]) * f;
      writeLathe(geo, blend);
      lastShape = state.stage;
      const bi = BOTTLES[i], bj = BOTTLES[i + 1];
      const D = (bi.D + (bj.D - bi.D) * f) * MM;
      sh.scale.set(D * 2.1, D * 2.1, 1);
    }
    bGroup.rotation.y = state.t * 0.25 + state.px * 0.6;
    bGroup.rotation.x = state.py * 0.08;

    // Camera frames the tallest container so growth reads at true relative scale.
    const bRect = rectOf(bottleSlot);
    bCam.aspect = bRect.w / Math.max(1, bRect.h);
    const fitH = 7.4, dist = (fitH / 2) / Math.tan(THREE.MathUtils.degToRad(bCam.fov / 2)) * (bCam.aspect < 0.75 ? 1.15 : 1);
    bCam.position.set(0, 3.4, dist); bCam.lookAt(0, 3.05, 0);
    bCam.updateProjectionMatrix();

    // Machine: compact range for small bottles, large-container machine from 5 L.
    const want = state.stage < 1.5 ? 0 : 1;
    if (want !== state.machine) { state.machine = want; state.mix = reduced ? 1 : 0; }
    state.mix = Math.min(1, state.mix + dt * 2.2);
    machineGroups.forEach((g, i) => {
      const on = i === state.machine;
      const k = on ? smooth(0, 1, state.mix) : 1 - smooth(0, 1, state.mix);
      g.visible = k > 0.01 && loaded[i] === true;
      g.scale.setScalar(0.88 + 0.12 * k);
      g.position.y = (1 - k) * -0.25;
      g.rotation.y = -0.55 + state.px * 0.45 + Math.sin(state.t * 0.2) * 0.04;
      g.traverse((o) => { if (o.isMesh) { o.material.transparent = k < 1; o.material.opacity = k; } });
    });
    const active = machineGroups[state.machine].userData.size;
    if (active) mShadow.scale.set(active.x * 1.5, active.z * 2.2, 1);
    const mRect = rectOf(machineSlot);
    mCam.aspect = mRect.w / Math.max(1, mRect.h);
    // The large-container machine is taller, so it gets a little more room above the spec card.
    const big = state.machine === 1;
    const mDist = (mCam.aspect < 1 ? 7.4 : 5.6) * (big ? 1.12 : 1);
    mCam.position.set(Math.sin(state.px * 0.15) * 0.4, 1.7 + state.py * 0.25, mDist);
    mCam.lookAt(0, big ? 0.72 : 0.95, 0);
    mCam.updateProjectionMatrix();

    renderer.setClearColor(0x000000, 0);
    renderer.setScissor(0, 0, canvas.width, canvas.height);
    renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    renderer.clear();
    for (const [scene, cam, r] of [[bScene, bCam, bRect], [mScene, mCam, mRect]]) {
      renderer.setViewport(r.x, r.y, r.w, r.h);
      renderer.setScissor(r.x, r.y, r.w, r.h);
      renderer.render(scene, cam);
    }
  }

  return { setStage, setPointer, setVisible, frame, resize, loaded };
}
