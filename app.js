// AOKTAC demo: scrubbed process film, 3D bottle beside Aoktac's machine photos,
// horizontal sectors story, scrubbed factory approach, quote form.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const barH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar-h")) || 64;
const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || Math.min(innerWidth, innerHeight) < 700;
const saveData = navigator.connection && (navigator.connection.saveData || /(^|-)2g$/.test(navigator.connection.effectiveType || ""));

/* ---------- Smooth scroll ---------- */
// Wheel and trackpad only. Touch devices keep native scrolling, which is smoother on phones and
// leaves sideways swiping in the sectors slider entirely to the browser.
const touchFirst = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
let lenis = null;
if (!reduceMotion && !touchFirst && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
  window.lenis = lenis;
}
function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
}
const scrollToEl = (el) => scrollToY(el.getBoundingClientRect().top + window.scrollY - barH());
$$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
  const id = a.getAttribute("href").slice(1);
  const el = id === "top" ? null : document.getElementById(id);
  if (id !== "top" && !el) return;
  e.preventDefault();
  if (el) scrollToEl(el); else scrollToY(0);
}));

/* ---------- Mobile menu ---------- */
const menuBtn = $(".bar__menu");
const nav = $("#nav");
const setMenu = (open) => { menuBtn.setAttribute("aria-expanded", String(open)); nav.classList.toggle("is-open", open); };
menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });

/* ---------- Shared helpers ---------- */
// Geometry is read once at the start of each frame, before anything is written, and values are
// written only when they change. The browser then never recalculates style or layout mid-frame,
// which is what makes scroll animation stutter on phones.
let frameRects = new Map(), vh = innerHeight;
function rectOf(el) {
  let r = frameRects.get(el);
  if (!r) { r = el.getBoundingClientRect(); frameRects.set(el, r); }
  return r;
}
const written = new WeakMap();
function setStyle(el, prop, value) {
  let w = written.get(el);
  if (!w) { w = {}; written.set(el, w); }
  if (w[prop] === value) return;
  w[prop] = value;
  if (prop.startsWith("--")) el.style.setProperty(prop, value); else el.style[prop] = value;
}
function progressOf(section) {
  const r = rectOf(section);
  const run = r.height - vh;
  return run > 0 ? clamp(-r.top / run, 0, 1) : (r.top < 0 ? 1 : 0);
}
function scrollForProgress(section, p) {
  const top = section.getBoundingClientRect().top + window.scrollY;
  return top + p * (section.offsetHeight - innerHeight);
}
function nearView(el, margin = 1.5) {
  const r = rectOf(el);
  return r.bottom > -vh * margin && r.top < vh * (1 + margin);
}
function fadeIn(t, from, to, fade) {
  if (t < from - fade || t > to + fade) return 0;
  if (t < from) return (t - (from - fade)) / fade;
  if (t > to) return 1 - (t - to) / fade;
  return 1;
}
function show(el, a, lift = 14) {
  a = Math.round(clamp(a, 0, 1) * 200) / 200;
  setStyle(el, "opacity", String(a));
  setStyle(el, "visibility", a > 0.01 ? "visible" : "hidden");
  setStyle(el, "transform", reduceMotion ? "" : `translateY(${((1 - a) * lift).toFixed(1)}px)`);
  const inert = a < 0.5;
  if (el.inert !== inert) el.inert = inert;
}

// WebKit (Safari, and every browser on iPhone and iPad) refuses video from blob: URLs,
// so there the film streams from its own URL instead of a downloaded copy.
const ua = navigator.userAgent;
const blobVideo = !(/AppleWebKit/.test(ua) && !/(Chrome|Chromium|Edg|OPR)\//.test(ua));

// A video scrubbed by scroll. Where blob video works the whole file is fetched once so every
// seek is instant; anywhere it fails, the file streams directly.
class Scrub {
  constructor(video, duration) { this.video = video; this.duration = duration; this.ready = false; this.shown = 0; this.loading = false; }
  attach(url) {
    const v = this.video;
    return new Promise((done) => {
      const finish = (ok) => { v.removeEventListener("loadeddata", yes); v.removeEventListener("error", no); done(ok); };
      const yes = () => finish(true), no = () => finish(false);
      v.addEventListener("loadeddata", yes);
      v.addEventListener("error", no);
      v.preload = "auto";
      v.src = url;
      v.load();
      // iOS decodes nothing until a video has played once; a muted inline play is allowed.
      if (!url.startsWith("blob:")) v.play()?.then(() => v.pause()).catch(() => {});
    });
  }
  async load(src) {
    if (this.loading || reduceMotion || saveData) return;
    this.loading = true;
    let ok = false;
    if (blobVideo) {
      let blob = null;
      for (let i = 0; i < 2 && !blob; i++) {
        try { const r = await fetch(src); if (r.ok) blob = await r.blob(); } catch { /* retry once */ }
      }
      // An untyped blob is refused by Firefox's media sniffer, so label it.
      if (blob) ok = await this.attach(URL.createObjectURL(blob.type ? blob : new Blob([blob], { type: "video/mp4" })));
    }
    if (!ok) ok = await this.attach(src);
    if (!ok) return;
    const v = this.video;
    v.pause();
    this.duration = v.duration || this.duration;
    v.currentTime = clamp(this.shown, 0, this.duration - 0.05);
    this.ready = true;
    v.classList.add("is-ready");
  }
  step(target, dt) {
    this.shown += (target - this.shown) * filmFollow(dt);
    if (Math.abs(target - this.shown) < 0.004) this.shown = target;
    const v = this.video;
    if (this.ready && !v.seeking) {
      const want = clamp(this.shown, 0, this.duration - 0.05);
      if (Math.abs(v.currentTime - want) > 0.015) v.currentTime = want;
    }
    return this.shown;
  }
}

// The same film as a numbered image sequence drawn to a canvas. Used where scrubbing a <video>
// is unreliable (Safari, and every phone and tablet): there is no seeking, so the picture
// tracks the scroll exactly.
//  - Frames download compressed, coarse to fine (every 16th first); frames the visitor is about
//    to reach jump the queue.
//  - Only frames near the current position are decoded, ahead of the scroll direction and off the
//    main thread (createImageBitmap), so drawing never waits on a decode and memory stays small.
//  - Every frame of the film is there (24 fps), so even a slow scroll moves frame by frame, and
//    each picture is a real, sharp frame rather than a blend.
const useFrames = !blobVideo || touchFirst;
// 24 fps frames: decode further ahead so a fast scroll never waits for a frame.
const AHEAD = 18, BEHIND = 6, KEEP = 32;
// How quickly the film catches up with the scroll. Touch scrolling is already smooth, so the film
// follows the finger directly; on desktop a light catch-up (about 50 ms) rides on smooth scrolling.
const filmFollow = (dt) => (reduceMotion || touchFirst ? 1 : 1 - Math.exp(-dt * 20));
class FrameScrub {
  constructor(canvas, duration) {
    this.canvas = canvas; this.ctx = canvas.getContext("2d", { alpha: false });
    this.duration = duration; this.fps = 10;
    this.ready = false; this.shown = 0; this.dir = ""; this.count = 0;
    this.ox = 50; this.pan = false; this.sig = "";
    this.retired = false; this.onReady = null;
    this.blobs = []; this.bitmaps = new Map(); this.decoding = new Set(); this.heading = 1;
    this.urgent = []; this.queue = []; this.inflight = 0; this.frameOf = new WeakMap(); this.speed = 0;
    // Canvas size is measured only when it changes, never during the frame loop.
    this.cw = canvas.clientWidth; this.ch = canvas.clientHeight;
    new ResizeObserver(() => { this.cw = canvas.clientWidth; this.ch = canvas.clientHeight; this.sig = ""; }).observe(canvas);
  }
  free() {
    for (const b of this.bitmaps.values()) b.close?.();
    this.bitmaps.clear(); this.decoding.clear();
  }
  // Hand over to the full video: stop fetching frames and fade the canvas out over it.
  retire() {
    this.retired = true;
    this.canvas.classList.remove("is-ready");
    setTimeout(() => this.free(), 600);
  }
  load(dir, count, pan = false) {
    if (reduceMotion || saveData || this.retired || dir === this.dir) return;
    this.free();
    this.dir = dir; this.pan = pan; this.count = count; this.fps = count / this.duration;
    this.blobs = new Array(count); this.ready = false; this.sig = ""; this.drawn = null;
    this.canvas.classList.remove("is-ready");
    const order = [0, count - 1], seen = new Set(order);
    for (const stride of [16, 8, 4, 2, 1]) for (let i = 0; i < count; i += stride) if (!seen.has(i)) { seen.add(i); order.push(i); }
    this.queue = order; this.urgent = []; this.inflight = 0;
    for (let k = 0; k < 6; k++) this.pump(dir);
  }
  pump(dir) {
    if (this.dir !== dir || this.retired) return;
    let i;
    while (this.urgent.length && (i === undefined || this.blobs[i] !== undefined)) i = this.urgent.shift();
    while ((i === undefined || this.blobs[i] !== undefined) && this.queue.length) i = this.queue.shift();
    if (i === undefined || this.blobs[i] !== undefined) return;
    this.blobs[i] = null;                       // requested
    this.inflight++;
    fetch(`${dir}${String(i).padStart(3, "0")}.webp`)
      .then((r) => (r.ok ? r.blob() : null))
      .catch(() => null)
      .then((blob) => {
        this.inflight--;
        if (this.dir !== dir) return;
        this.blobs[i] = blob || undefined;
        this.pump(dir);
      });
  }
  decode(i) {
    if (i < 0 || i >= this.count || this.bitmaps.has(i) || this.decoding.has(i)) return;
    const blob = this.blobs[i];
    if (!blob) {
      if (blob === undefined && !this.urgent.includes(i)) { this.urgent.push(i); if (this.inflight < 6) this.pump(this.dir); }
      return;
    }
    if (this.decoding.size >= 4) return;
    this.decoding.add(i);
    const dir = this.dir;
    const done = (bm) => {
      this.decoding.delete(i);
      if (this.dir !== dir || this.retired) { bm?.close?.(); return; }
      if (bm) { this.bitmaps.set(i, bm); this.frameOf.set(bm, i); }
    };
    if (window.createImageBitmap) createImageBitmap(blob).then(done, () => done(null));
    else { const img = new Image(); img.src = URL.createObjectURL(blob); img.decode().then(() => done(img), () => done(null)); }
  }
  // Before anything is on screen, start from the closest frame already downloaded; the exact
  // frames replace it a moment later.
  firstPicture(i0) {
    let best = null, bestD = Infinity;
    for (const [k, bm] of this.bitmaps) { const d = Math.abs(k - i0); if (d < bestD) { best = bm; bestD = d; } }
    if (bestD > 1) for (let d = 0; d < this.count; d++) {
      if (this.blobs[i0 - d]) { this.decode(i0 - d); break; }
      if (this.blobs[i0 + d]) { this.decode(i0 + d); break; }
    }
    return best;
  }
  // Keep decoded frames around the position, weighted toward where the scroll is heading.
  keepWindow(c) {
    const h = this.heading;
    // When scrolling fast only every 2nd or 3rd frame is shown, so decode just those, further out.
    const stride = clamp(Math.round(this.speed), 1, 4);
    this.decode(c);
    for (let d = 1; d <= AHEAD; d++) this.decode(c + d * h * stride);
    for (let d = 1; d <= BEHIND; d++) this.decode(c - d * h);
    for (const [k, b] of this.bitmaps) if (Math.abs(k - c) > KEEP) { b.close?.(); this.bitmaps.delete(k); }
  }
  step(target, dt) {
    const before = this.shown;
    this.shown += (target - this.shown) * filmFollow(dt);
    if (Math.abs(target - this.shown) < 0.002) this.shown = target;
    if (!this.count || this.retired) return this.shown;
    if (this.shown !== before) this.heading = this.shown > before ? 1 : -1;
    // Every film frame is a real, sharp frame: the nearest one is drawn, never a blend of two.
    const i = Math.round(clamp(this.shown * this.fps, 0, this.count - 1));
    this.speed = this.speed * 0.7 + Math.abs(i - (this.lastI ?? i)) * 0.3;   // frames per refresh
    this.lastI = i;
    this.keepWindow(i);
    let a = this.bitmaps.get(i);
    if (!a) {
      // Exact frame not decoded yet (a fast flick): show the closest one that is, so the picture
      // keeps moving with the scroll; before anything is on screen, the nearest downloaded frame.
      let best = null, bestD = 25;
      for (const [k, bm] of this.bitmaps) { const d = Math.abs(k - i); if (d < bestD) { best = bm; bestD = d; } }
      a = best || (!this.ready ? this.firstPicture(i) : null);
      if (!a) return this.shown;
    }
    if (!this.cw || !this.ch) return this.shown;
    const c = this.canvas, iw = a.width, ih = a.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(this.cw * dpr), h = Math.round(this.ch * dpr);
    const ox = this.pan ? this.ox : 50;
    const sig = `${w}x${h}:${ox.toFixed(1)}`;
    if (a === this.drawn && sig === this.sig) return this.shown;   // same frame, same canvas
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    // cover-fit, with the same horizontal focus as CSS object-position; high-quality scaling to
    // the screen's pixels keeps edges crisp
    const s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(a, (w - dw) * ox / 100, (h - dh) / 2, dw, dh);
    this.drawn = a; this.sig = sig; c.frameShown = this.frameOf.get(a);   // read by QA tooling only
    if (!this.ready) { this.ready = true; c.classList.add("is-ready"); this.onReady?.(); }
    return this.shown;
  }
}

// Frames first, video second. The image sequence is ready after about 0.5 MB, so the film
// follows the scroll almost at once on any connection. On desktop Chrome, Edge and Firefox the
// full 24 fps video then downloads in the background and takes over at the same moment of the
// film; everywhere else the frames stay.
function filmPlayer(canvas, video, duration) {
  const frames = new FrameScrub(canvas, duration);
  const full = useFrames ? null : new Scrub(video, duration);
  return {
    frames, full, duration,
    get ready() { return frames.ready || !!full?.ready; },
    get shown() { return full?.ready ? full.shown : frames.shown; },
    set ox(v) { frames.ox = v; },
    load(frameDir, count, pan, videoSrc) {
      if (full && videoSrc && !this.videoQueued) {
        this.videoQueued = true;
        frames.onReady = () => full.load(videoSrc);
        setTimeout(() => full.load(videoSrc), 4000);   // also if the frames never arrive
      }
      frames.load(frameDir, count, pan);
    },
    step(target, dt) {
      if (full?.ready) {
        if (!frames.retired) frames.retire();
        return full.step(target, dt);
      }
      const t = frames.step(target, dt);
      if (full) full.shown = t;   // the video starts exactly where the frames are
      return t;
    },
  };
}

/* ---------- 1. Hero and process film ---------- */
const film = $("#film");
const filmStage = $(".film__stage", film);
const filmMedia = $(".film__media", film);
const filmHeat = $(".film__heat", film);
const filmScrub = filmPlayer($(".film__frames", film), $(".film__video", film), 22.13);
const stills = $$(".film__still", film);
const CAPS = {
  hero: { from: -1, to: 1.2, fade: 1.1 }, cue: { from: -1, to: 0.4, fade: 0.8 },
  heat: { from: 4.4, to: 9.2, fade: 0.7 }, stretch: { from: 11.4, to: 13.4, fade: 0.6 },
  blow: { from: 14.2, to: 16.6, fade: 0.6 }, output: { from: 18.6, to: 99, fade: 0.8 },
};
const caps = $$("[data-cap]", film).map((el) => ({ el, cfg: CAPS[el.dataset.cap] }));
const STILL_AT = [0, 6.04, 11.08, 17.12, 22.13];
const FOCUS = [[0, 76], [3, 62], [6, 30], [9.5, 40], [11.08, 50], [17.12, 50], [19, 62], [22.13, 70]];
const focusAt = (t) => {
  for (let i = 1; i < FOCUS.length; i++) {
    const [t1, x1] = FOCUS[i], [t0, x0] = FOCUS[i - 1];
    if (t <= t1) return x0 + (x1 - x0) * ((t - t0) / (t1 - t0 || 1));
  }
  return FOCUS.at(-1)[1];
};
let lastStill = -1;
function paintFilm(dt) {
  if (!nearView(film, 0.2)) return;
  const portrait = innerWidth / innerHeight < 1.2;
  filmScrub.ox = portrait ? focusAt(filmScrub.shown) : 50;
  const t = filmScrub.step(filmScrub.duration * progressOf(film), dt);
  // --ox pans the stills and video; the canvas pans itself, so skip it while the canvas shows.
  if (!(filmScrub.frames.ready && !filmScrub.full?.ready)) setStyle(filmMedia, "--ox", portrait ? `${focusAt(t).toFixed(1)}%` : "50%");
  setStyle(filmHeat, "opacity", clamp(1 - Math.abs(t - 7) / 4, 0, 1).toFixed(2));
  setStyle(filmMedia, "--wash", clamp(1 - t / 1.8, 0, 1).toFixed(2));
  for (const { el, cfg } of caps) show(el, fadeIn(t, cfg.from, cfg.to, cfg.fade));
  if (!filmScrub.ready) {
    let idx = 0;
    STILL_AT.forEach((s, i) => { if (t >= s - 1.5) idx = i; });
    if (idx !== lastStill) { stills.forEach((img, i) => img.classList.toggle("is-on", i === idx)); lastStill = idx; }
  } else if (lastStill !== -2) {
    // The film has taken over: release the five full-HD stills from memory and compositing.
    stills.forEach((img) => { img.classList.remove("is-on"); setTimeout(() => { img.hidden = true; }, 500); });
    lastStill = -2;
  }
}
// Full HD everywhere; phones, tablets and slow connections get a lighter encode of the same 1080p frames.
const slowNet = navigator.connection && /(^|-)3g$/.test(navigator.connection.effectiveType || "");
const liteVideo = innerWidth < 1100 || lowPower || slowNet;
// Frame sets: phones get a 608x1080 crop that already follows the film's pan; wider screens
// get 1600x900 frames panned on the canvas.
const filmVideoSrc = liteVideo ? "assets/film/film-1920-lite.mp4" : "assets/film/film-1920.mp4";
const filmFrames = () => innerWidth / innerHeight < 0.8
  ? filmScrub.load("assets/film/frames/hero-p/", 531, false, filmVideoSrc)
  : filmScrub.load("assets/film/frames/hero-l/", 531, true, filmVideoSrc);
addEventListener("resize", () => { if (filmScrub.frames.dir) filmFrames(); });
// Start as soon as the page is parsed rather than after every image has loaded.
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", filmFrames, { once: true }); else filmFrames();

/* ---------- 2. Bottle and machine showcase ---------- */
const STOPS = [
  { litres: "0.6 L", dims: "Up to Ø 65 × 250 mm", model: "RL-12", cav: "12", bph: "24,000 BPH" },
  { litres: "2 L", dims: "Up to Ø 95 × 320 mm", model: "RL-6II", cav: "6", bph: "12,000 BPH" },
  { litres: "5 L", dims: "Up to Ø 180 × 360 mm", model: "RL-4-5L", cav: "4", bph: "On request" },
  { litres: "20 L", dims: "Up to Ø 300 × 550 mm", model: "RL-2-20L", cav: "2", bph: "1,200 BPH" },
  { litres: "30 L", dims: "Up to Ø 290 × 600 mm", model: "RL-1-30L", cav: "1", bph: "300 BPH" },
];
// Aoktac's machine photos, one per size stop. Credits name what is pictured; where the photo
// is not the model in the spec card, the credit says so.
const PHOTOS = [
  "Pictured: an Aoktac rendering of a two-step machine, panels off.",
  "Pictured: TEC BLOW RL-6II.",
  "Pictured: AOK-2000 NEW TEC, not the RL-4-5L.",
  "Pictured: an Aoktac one-step machine, not the RL-2-20L.",
  "Pictured: the large-container TEC BLOW from the RL-1-30L page.",
];
const showSec = $("#machines");
const showStage = $(".show__stage", showSec);
const ui = {
  litres: $("#show-litres"), dims: $("#show-dims"), model: $("#show-model"), cav: $("#show-cav"),
  bph: $("#show-bph"), cta: $("#show-cta"), credit: $("#show-credit"),
  stops: $$(".show__scale button", showSec), bottleImg: $(".show__bottle-img", showSec), photos: $$(".show__photo", showSec),
};
let showcase = null, showcaseLoading = false, showcaseRetired = false, showIndex = -1, showStageVal = 0;
// Software WebGL (hardware acceleration off, virtual machines, blocklisted GPUs) draws the
// glass bottle at a few frames a second and stalls the whole page, so it gets the images.
const gpuName = (() => {
  try {
    const gl = document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl");
    if (!gl) return null;
    // Firefox reports the real renderer directly; Chromium and WebKit need the debug extension.
    const plain = String(gl.getParameter(gl.RENDERER) || "");
    if (!/^(WebKit WebGL|Mozilla)$/i.test(plain)) return plain;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : plain;
  } catch { return null; }
})();
const hasWebGL = gpuName !== null && !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpuName);
if (!hasWebGL) showSec.classList.add("no-webgl");

// One scroll = one size. The scroll position only picks a size (the nearest stop); the bottle and
// the machine photo then animate to it in about half a second, so the section never rests between
// two sizes.
const stopFromProgress = (p) => Math.round(p * (STOPS.length - 1));
function setShowIndex(i) {
  if (i === showIndex) return;
  showIndex = i;
  const s = STOPS[i];
  ui.litres.textContent = s.litres;
  ui.dims.textContent = s.dims;
  ui.model.textContent = `TEC BLOW ${s.model.replace(/-/g, "‑")}`; // non-breaking hyphens keep the model code on one line
  ui.cav.textContent = s.cav;
  ui.bph.textContent = s.bph;
  ui.credit.textContent = `${PHOTOS[i]} Images from Aoktac, not to scale with the bottle.`
    .replace(/\b(RL|AOK)-[\w-]+/g, (m) => m.replace(/-/g, "‑")); // model codes stay on one line
  if (ui.bottleImg) ui.bottleImg.src = `assets/img/bottle-${i}.webp`;
  ui.cta.dataset.model = s.model;
  ui.cta.dataset.size = s.litres;
  ui.photos.forEach((img, k) => img.setAttribute("aria-hidden", k === i ? "false" : "true"));
  ui.stops.forEach((b, k) => { if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
  if (!reduceMotion) {
    for (const el of [ui.litres, ui.model]) {
      el.getAnimations().forEach((a) => a.cancel());
      el.animate([{ opacity: 0.2, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });
    }
  }
}
async function initShowcase() {
  if (showcase || showcaseLoading || showcaseRetired || !hasWebGL) return;
  showcaseLoading = true;
  try {
    const { createShowcase } = await import("./showcase3d.js");
    const sc = createShowcase({
      canvas: $(".show__canvas", showSec),
      bottleSlot: $("[data-slot=bottle]", showSec),
      lowPower,
      reduced: reduceMotion,
      spin: !touchFirst,      // phones: no idle spin, so the bottle is drawn only when it changes
    });
    await sc.warm();
    showcase = sc;
  } catch (err) {
    console.warn("3D showcase unavailable", err);
    showSec.classList.add("no-webgl");
    showIndex = -1;
  }
}
// Photos follow the same curve the bottle uses to morph between sizes: the outgoing machine
// clears in the first half of the morph and the next one arrives as its bottle settles.
// Fading through the backdrop avoids two cut-out machines showing through each other.
const photoPaint = ui.photos.map(() => ({ o: -1, x: 0 }));
function paintPhotos(stage) {
  const n = STOPS.length - 1, i = Math.min(n - 1, Math.floor(stage)), f = smooth(0.12, 0.88, stage - i);
  ui.photos.forEach((img, k) => {
    const o = k === i ? 1 - smooth(0.04, 0.5, f) : k === i + 1 ? smooth(0.5, 0.96, f) : 0;
    const x = reduceMotion ? 0 : k === i ? -f * 3 : k === i + 1 ? (1 - f) * 3 : 0;
    const last = photoPaint[k], ro = Math.round(o * 1000) / 1000, rx = Math.round(x * 100) / 100;
    if (ro === last.o && rx === last.x) return;
    last.o = ro; last.x = rx;
    img.style.opacity = ro;
    img.style.transform = rx ? `translate3d(${rx}%, 0, 0)` : "";
    img.style.visibility = ro > 0 ? "visible" : "hidden";
  });
}
// Frame-time watchdog for the 3D bottle. Slow frames first drop it to lighter rendering,
// then to the pre-rendered bottle images, so scrolling never stalls on a weak GPU.
const watch = { last: 0, n: 0, sum: 0, warm: 0, level: 0 };
function retireShowcase() {
  showcase.dispose();
  showcase = null;
  showcaseRetired = true;
  showSec.classList.add("no-webgl");
  showIndex = -1;
}
function watchShowcase(now) {
  const gap = now - watch.last;
  watch.last = now;
  if (gap > 1000 || ++watch.warm < 20) return;      // skip shader compiles and returns from a hidden tab
  watch.n++; watch.sum += gap;
  const avg = watch.sum / watch.n;
  if (watch.n >= 10 && avg > 120) return retireShowcase();
  if (watch.n < 40) return;
  watch.n = 0; watch.sum = 0;
  if (avg < 26) return;
  if (watch.level === 0) { watch.level = 1; showcase.setQuality(1); watch.warm = 0; }
  else retireShowcase();
}
// The 3D scene is built at the first pause in scrolling (usually right after the page loads), or at
// the latest one screen away, so its one-off setup never lands in the middle of a scroll.
let lastScrollAt = 0;
addEventListener("scroll", () => { lastScrollAt = performance.now(); }, { passive: true });
function paintShow(dt) {
  const near = nearView(showSec, 1);
  if (near || (document.readyState === "complete" && performance.now() - lastScrollAt > 250)) initShowcase();
  if (!near && !showcase) return;
  const target = stopFromProgress(progressOf(showSec));
  showStageVal += (target - showStageVal) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 6.5));
  if (Math.abs(target - showStageVal) < 0.002) showStageVal = target;
  setShowIndex(clamp(Math.round(showStageVal), 0, STOPS.length - 1));
  paintPhotos(showStageVal);
  if (showcase) {
    const visible = nearView(showSec, 0.05);
    showcase.setVisible(visible);
    showcase.setStage(showStageVal);
    if (visible) { showcase.frame(dt); watchShowcase(performance.now()); } else watch.warm = 0;
  }
}
if (canHover && !reduceMotion) {
  showStage.addEventListener("pointermove", (e) => {
    const r = showStage.getBoundingClientRect();
    showcase?.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  });
  showStage.addEventListener("pointerleave", () => showcase?.setPointer(0, 0));
}
// Each stop holds over the middle of its scroll band; jump to that point.
// Desktop (wheel and trackpad): while the section is pinned, a scroll moves exactly one size.
//  - A trackpad sends a stream of ever-changing amounts. One gesture, inertia included, is one
//    step; the gesture ends when the stream pauses.
//  - A mouse wheel sends identical notches (100 px in Chrome, 3 lines in Firefox). Held spinning
//    keeps stepping, one size per animation, and carries on out of the section at either end.
let wheelAt = 0, wheelDir = 0, wheelAbs = 0, stepping = false, stepTimer = 0;
addEventListener("wheel", (e) => {
  if (!lenis) return;
  const r = showSec.getBoundingClientRect(), run = r.height - innerHeight;
  if (run <= 0 || r.top > 2 || r.bottom < innerHeight - 2) return;          // not pinned
  // Event time, not handling time: if the page is briefly busy, queued events of the same gesture
  // must not look like a pause.
  const now = e.timeStamp, dir = Math.sign(e.deltaY), abs = Math.abs(e.deltaY);
  if (!dir) return;
  const fresh = now - wheelAt > 220 || dir !== wheelDir;
  const notch = (e.deltaMode === 1 || abs >= 50) && Math.abs(abs - wheelAbs) <= abs * 0.02;
  wheelAt = now; wheelDir = dir; wheelAbs = abs;
  const pushing = fresh || notch;
  const n = STOPS.length - 1, at = stopFromProgress(clamp(-r.top / run, 0, 1));
  if (pushing && !stepping && ((dir > 0 && at >= n) || (dir < 0 && at <= 0))) return;   // leave
  e.preventDefault();
  e.stopPropagation();
  if (stepping) return;
  const to = pushing ? clamp(at + dir, 0, n) : at;      // the rest of a trackpad gesture settles
  const target = scrollForProgress(showSec, to / n);
  if (!pushing && Math.abs(target - scrollY) < 2) return;   // already on a size: just absorb
  const duration = pushing ? 0.65 : 0.4;
  stepping = true;
  clearTimeout(stepTimer);
  stepTimer = setTimeout(() => { stepping = false; }, duration * 1000 + 80);
  lenis.scrollTo(target, { duration, force: true });
}, { capture: true, passive: false });
// Touch: sizes are 40% of a screen apart, so any ordinary swipe changes size. When a swipe comes
// to rest inside the pinned section, the page glides to the nearest size; outside it nothing is
// touched, so scrolling in and out stays completely free.
if (touchFirst) {
  let settle = 0, touching = false;
  const settleShow = () => {
    if (touching) return;
    const r = showSec.getBoundingClientRect(), run = r.height - innerHeight;
    if (run <= 0 || r.top > 0 || r.bottom < innerHeight) return;            // only while pinned
    const n = STOPS.length - 1, k = stopFromProgress(clamp(-r.top / run, 0, 1));
    const y = scrollForProgress(showSec, k / n);
    if (Math.abs(y - scrollY) > 2) window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  };
  const queue = () => { clearTimeout(settle); settle = setTimeout(settleShow, 160); };
  addEventListener("touchstart", () => { touching = true; clearTimeout(settle); }, { passive: true });
  addEventListener("touchend", () => { touching = false; queue(); }, { passive: true });
  addEventListener("scroll", queue, { passive: true });
}
ui.stops.forEach((b, i) => b.addEventListener("click", () => {
  const n = STOPS.length - 1;
  scrollToY(scrollForProgress(showSec, i / n));
}));

/* ---------- 3. Horizontal sectors ---------- */
const hz = $("#sectors");
const hzTrack = $(".hz__track", hz);
const hzPanels = $$(".hz__panel", hz);
const hzBar = $(".hz__progress", hz);
const swipeQuery = window.matchMedia("(max-width: 900px), (orientation: portrait) and (max-width: 1100px)");
let hzSwipe = true, hzRun = 0;
const hzIntro = $(".hz__panel--intro", hz);
const hzStage = $(".hz__stage", hz);
function layoutHz() {
  hzSwipe = reduceMotion || swipeQuery.matches;
  hz.classList.toggle("is-swipe", hzSwipe);
  // On touch layouts the intro becomes a heading above the swipe row, so the row opens on a full photo.
  if (hzSwipe && hzIntro.parentElement !== hzStage) hzStage.insertBefore(hzIntro, hzTrack);
  if (!hzSwipe && hzIntro.parentElement !== hzTrack) hzTrack.insertBefore(hzIntro, hzTrack.firstChild);
  hzMax = hzTrack.scrollWidth - hzTrack.clientWidth;
  if (hzSwipe) { hz.style.height = ""; hzTrack.style.transform = ""; written.delete(hzTrack); return; }
  hzRun = Math.max(0, hzTrack.scrollWidth - innerWidth);
  hz.style.height = `${innerHeight + hzRun / 0.92}px`;
  hzBoxes = hzPanels.map((panel) => ({ img: panel.querySelector(".hz__media img"), left: panel.offsetLeft, width: panel.offsetWidth }));
}
let hzMax = 0, hzBoxes = [];
// In the swipe row the progress line follows the row's own scroll, not every frame.
hzTrack.addEventListener("scroll", () => {
  if (hzSwipe) setStyle(hzBar, "--hp", hzMax > 0 ? (hzTrack.scrollLeft / hzMax).toFixed(3) : "0");
}, { passive: true });
// Load every sector photo once the section is near. Lazy images inside a sideways scroller only
// start when swiped into view on iPhone, which would show blank cards mid-swipe.
let hzWarm = false;
function paintHz() {
  if (!hzWarm && nearView(hz, 1.5)) {
    hzWarm = true;
    for (const img of $$("img", hz)) { img.loading = "eager"; img.decode?.().catch(() => {}); }
  }
  if (hzSwipe) return;
  if (!nearView(hz, 0.2)) return;
  const raw = progressOf(hz);
  const p = clamp((raw - 0.08) / 0.92, 0, 1);   // hold the intro whole before the row moves
  const shift = p * hzRun;
  setStyle(hzTrack, "transform", `translate3d(${(-shift).toFixed(1)}px,0,0)`);
  setStyle(hzBar, "--hp", p.toFixed(3));
  // Each image drifts against its panel as it crosses the screen (positions from the cached layout).
  const vw = innerWidth;
  for (const { img, left, width } of hzBoxes) {
    if (!img) continue;
    const off = clamp(((left - shift + width / 2) - vw / 2) / vw, -0.6, 0.6);
    setStyle(img, "--sx", `${(-off * 0.045 * width).toFixed(1)}px`);   // drift scales with the card, inside its bleed
  }
}
if (canHover && !reduceMotion) {
  for (const panel of $$("[data-tilt]")) {
    const img = panel.querySelector("img");
    panel.addEventListener("pointermove", (e) => {
      const r = panel.getBoundingClientRect();
      img.style.setProperty("--px", `${(((e.clientX - r.left) / r.width) - 0.5) * -0.025 * r.width}px`);
      img.style.setProperty("--py", `${(((e.clientY - r.top) / r.height) - 0.5) * -0.015 * r.height}px`);
    });
    panel.addEventListener("pointerleave", () => { img.style.setProperty("--px", "0px"); img.style.setProperty("--py", "0px"); });
  }
}
layoutHz();
addEventListener("resize", layoutHz);
swipeQuery.addEventListener?.("change", layoutHz);
addEventListener("load", layoutHz, { once: true });

/* ---------- 4. Factory approach ---------- */
const fac = $("#factory");
const facScrub = filmPlayer($(".fac__frames", fac), $(".fac__video", fac), 10);
const facPoster = $(".fac__poster", fac);
const beats = $$(".fac__beat", fac);
const BEATS = [[0, 0.2], [0.28, 0.46], [0.54, 0.72], [0.8, 1.2]];
const facPortrait = () => innerWidth / innerHeight < 0.9;
if (facPortrait()) facPoster.src = "assets/film/factory-poster-p.webp";
function paintFac(dt) {
  // Fetch three screens early so the frames are already here when the visitor arrives.
  if (nearView(fac, 3)) {
    facScrub.load(facPortrait() ? "assets/film/frames/fac-p/" : "assets/film/frames/fac-l/", 200, false,
      facPortrait() ? "assets/film/factory-1080p.mp4" : "assets/film/factory-1920.mp4");
  }
  if (!nearView(fac, 0.2)) return;
  const p = progressOf(fac);
  facScrub.step(p * facScrub.duration, dt);
  beats.forEach((el, i) => show(el, fadeIn(p, BEATS[i][0], BEATS[i][1], 0.06), 22));
}

/* ---------- Frame loop ---------- */
let last = performance.now();
function tick(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  lenis?.raf(now);
  // read phase: every section's position for this frame, before any writes
  frameRects = new Map(); vh = innerHeight;
  rectOf(film); rectOf(showSec); rectOf(hz); rectOf(fac);
  paintFilm(dt);
  paintShow(dt);
  paintHz();
  paintFac(dt);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- Quote form ---------- */
const form = $("#quote");
const status = $("#quote-status");
const modelSelect = $("#q-model");
const sizeInput = $("#q-size");
ui.cta.addEventListener("click", () => {
  modelSelect.value = ui.cta.dataset.model || "";
  sizeInput.value = ui.cta.dataset.size || "";
  setTimeout(() => $("#q-name").focus({ preventScroll: true }), reduceMotion ? 0 : 1400);
});
function check(input, errId, test) {
  const ok = test(input.value.trim());
  input.setAttribute("aria-invalid", ok ? "false" : "true");
  const err = document.getElementById(errId);
  err.hidden = ok;
  if (ok) input.removeAttribute("aria-describedby"); else input.setAttribute("aria-describedby", errId);
  return ok;
}
const nameIn = $("#q-name");
const emailIn = $("#q-email");
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
nameIn.addEventListener("blur", () => nameIn.value && check(nameIn, "q-name-err", (v) => v.length > 1));
emailIn.addEventListener("blur", () => emailIn.value && check(emailIn, "q-email-err", emailOk));
// A flagged field re-checks as it is corrected, so its error clears while typing. Clearing it
// on blur instead would shift the send button mid-tap and the tap would miss.
nameIn.addEventListener("input", () => nameIn.getAttribute("aria-invalid") === "true" && check(nameIn, "q-name-err", (v) => v.length > 1));
emailIn.addEventListener("input", () => emailIn.getAttribute("aria-invalid") === "true" && check(emailIn, "q-email-err", emailOk));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const a = check(nameIn, "q-name-err", (v) => v.length > 1);
  const b = check(emailIn, "q-email-err", emailOk);
  if (!a || !b) { status.className = "quote__status"; status.textContent = "Check the highlighted fields."; (!a ? nameIn : emailIn).focus(); return; }
  status.className = "quote__status is-ok";
  status.textContent = "Demo only: on the live site this request goes to sales@aoktac.com.";
});
