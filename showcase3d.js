// AOKTAC 3D showcase: a PET bottle that grows through the published TEC BLOW
// container envelopes. The machine beside it is Aoktac's own photography, driven by app.js.
import * as THREE from "three";

let N = 220;            // profile samples, shared by every bottle so shapes can morph
let SEG = 128;          // radial segments (both lowered on phones and low-power devices)
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
  g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(pos.length), 3));
  // Fixed bounds that hold every size (tallest is 0.6 m): no per-reshape bounds pass.
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 3, 0), 4.5);
  return g;
}
const ringCos = [], ringSin = [];
function writeLathe(g, prof) {
  const p = g.attributes.position.array, nrm = g.attributes.normal.array, W = SEG + 1;
  if (ringCos.length !== W) { ringCos.length = ringSin.length = 0; for (let j = 0; j <= SEG; j++) { const th = (j / SEG) * Math.PI * 2; ringCos.push(Math.cos(th)); ringSin.push(Math.sin(th)); } }
  let k = 0;
  for (let i = 0; i < N; i++) {
    const r = prof[i * 3], y = prof[i * 3 + 1], pe = prof[i * 3 + 2];
    for (let j = 0; j <= SEG; j++) {
      const rr = pe ? r * (1 - pe + pe * (0.55 + 0.45 * Math.cos(5 * (j / SEG) * Math.PI * 2))) : r;
      p[k++] = ringCos[j] * rr; p[k++] = y; p[k++] = ringSin[j] * rr;
    }
  }
  // Normals straight from the surface grid (along the profile x around the bottle): a fraction of
  // the cost of a triangle-by-triangle pass, which matters because the mesh reshapes while scrolling.
  for (let i = 0; i < N; i++) {
    const iu = Math.min(N - 1, i + 1) * W, id = Math.max(0, i - 1) * W, ic = i * W;
    for (let j = 0; j <= SEG; j++) {
      const jr = j === SEG ? 1 : j + 1, jl = j === 0 ? SEG - 1 : j - 1;
      const u = (iu + j) * 3, d = (id + j) * 3, rgt = (ic + jr) * 3, lft = (ic + jl) * 3;
      const ax = p[u] - p[d], ay = p[u + 1] - p[d + 1], az = p[u + 2] - p[d + 2];
      const bx = p[rgt] - p[lft], by = p[rgt + 1] - p[lft + 1], bz = p[rgt + 2] - p[lft + 2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const len = Math.hypot(nx, ny, nz) || 1;
      const o = (ic + j) * 3;
      nrm[o] = nx / len; nrm[o + 1] = ny / len; nrm[o + 2] = nz / len;
    }
  }
  g.attributes.position.needsUpdate = true;
  g.attributes.normal.needsUpdate = true;
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
// The softboxes draw clean highlights along clear PET.
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

// The viewport is a small photo studio: graded backdrop, soft key shadow, contact shadow.
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

export function createShowcase({ canvas, bottleSlot, lowPower, reduced, spin = true }) {
  // A lighter mesh on phones: identical at that size, and about a third of the work per reshape.
  if (lowPower) { N = 150; SEG = 80; }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !lowPower;
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

  const state = { stage: 0, px: 0, py: 0, tx: 0, ty: 0, visible: false, t: 0 };
  let lastKey = "";

  function rectOf(el) {
    const r = el.getBoundingClientRect(), c = canvas.getBoundingClientRect();
    return { x: r.left - c.left, y: c.bottom - r.bottom, w: r.width, h: r.height };
  }
  // The bottle slot sits at a fixed place on the canvas (both live in the pinned stage), so it is
  // measured on resize, not every frame.
  let slot = null;
  function resize() { renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); slot = rectOf(bottleSlot); lastKey = ""; }
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener("resize", resize);

  // Reduced quality for slow GPUs: 1x pixels, half-resolution refraction, no soft shadow map
  // (the contact blob stays). app.js calls this when frames run long.
  function setQuality(level) {
    if (level >= 1) {
      renderer.setPixelRatio(1);
      if ("transmissionResolutionScale" in renderer) renderer.transmissionResolutionScale = 0.5;
      renderer.shadowMap.enabled = false;
      bottle.castShadow = false; cap.castShadow = false;
      pet.needsUpdate = true; capMat.needsUpdate = true;
      resize();
      lastKey = "";
    }
  }
  function dispose() {
    window.removeEventListener("resize", resize);
    renderer.dispose();
    renderer.forceContextLoss();
  }
  resize();

  function setStage(s) { state.stage = s; }
  function setPointer(x, y) { state.tx = x; state.ty = y; }
  function setVisible(v) { state.visible = v; }

  const cA = new THREE.Color(), cB = new THREE.Color();
  let lastShape = -1;
  function frame(dt) {
    if (!state.visible) return;
    if (spin && !reduced) state.t += dt;
    state.px += (state.tx - state.px) * (1 - Math.exp(-dt * 4));
    state.py += (state.ty - state.py) * (1 - Math.exp(-dt * 4));

    // Bottle morph between the two neighbouring published envelopes
    // Reshape in 64 steps per size change: invisible at this scale, and far fewer mesh rebuilds.
    const shape = Math.round(state.stage * 64) / 64;
    if (Math.abs(shape - lastShape) > 1e-4) {
      const i = Math.min(BOTTLES.length - 2, Math.floor(shape));
      const f = smooth(0.12, 0.88, shape - i);
      const bi = BOTTLES[i], bj = BOTTLES[i + 1];
      const a = profiles[i], b = profiles[i + 1];
      for (let k = 0; k < blend.length; k++) blend[k] = a[k] + (b[k] - a[k]) * f;
      writeLathe(geo, blend);
      lastShape = shape;
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
    const bRect = slot || (slot = rectOf(bottleSlot));
    bCam.aspect = bRect.w / Math.max(1, bRect.h);
    const dist = (7.4 / 2) / Math.tan(THREE.MathUtils.degToRad(bCam.fov / 2)) * (bCam.aspect < 0.75 ? 1.15 : 1);
    bCam.position.set(0, 3.6, dist); bCam.lookAt(0, 3.05, 0);
    bCam.updateProjectionMatrix();

    // Without the idle spin (phones), draw only when something on screen changed: the GPU then
    // rests while the visitor reads, and the phone does not heat up and slow down. The last
    // frame stays on screen in the meantime.
    const key = `${state.stage.toFixed(4)}|${state.px.toFixed(3)}|${state.py.toFixed(3)}|${bRect.w}x${bRect.h}|${canvas.width}`;
    if (!spin && key === lastKey) return;
    lastKey = key;
    renderer.setScissor(0, 0, canvas.width, canvas.height);
    renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    if (bRect.w < 2 || bRect.h < 2) return;
    renderer.setViewport(bRect.x, bRect.y, bRect.w, bRect.h);
    renderer.setScissor(bRect.x, bRect.y, bRect.w, bRect.h);
    renderer.render(B.scene, bCam);
  }

  // Compile shaders without blocking the page, then draw once, so the first visible frame is instant.
  // The shadow and refraction passes only compile on a real draw, so draw once here too (the
  // canvas is still off screen), keeping that one-off cost out of the visitor's first look.
  async function warm() {
    try { if (renderer.compileAsync && renderer.extensions.has("KHR_parallel_shader_compile")) await renderer.compileAsync(B.scene, bCam); } catch { /* compiled by the draw below */ }
    const was = state.visible;
    state.visible = true; frame(0.016); state.visible = was;
  }

  return { setStage, setPointer, setVisible, frame, resize, setQuality, dispose, warm };
}
