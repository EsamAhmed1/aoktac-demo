// AOKTAC demo, round 2: scrubbed process film, 3D bottle and machine showcase,
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
let lenis = null;
if (!reduceMotion && window.Lenis) {
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
function progressOf(section) {
  const r = section.getBoundingClientRect();
  const run = r.height - innerHeight;
  return run > 0 ? clamp(-r.top / run, 0, 1) : (r.top < 0 ? 1 : 0);
}
function scrollForProgress(section, p) {
  const top = section.getBoundingClientRect().top + window.scrollY;
  return top + p * (section.offsetHeight - innerHeight);
}
function nearView(el, margin = 1.5) {
  const r = el.getBoundingClientRect();
  return r.bottom > -innerHeight * margin && r.top < innerHeight * (1 + margin);
}
function fadeIn(t, from, to, fade) {
  if (t < from - fade || t > to + fade) return 0;
  if (t < from) return (t - (from - fade)) / fade;
  if (t > to) return 1 - (t - to) / fade;
  return 1;
}
function show(el, a, lift = 14) {
  a = clamp(a, 0, 1);
  el.style.opacity = a.toFixed(3);
  el.style.visibility = a > 0.01 ? "visible" : "hidden";
  el.style.transform = reduceMotion ? "" : `translateY(${((1 - a) * lift).toFixed(1)}px)`;
  el.inert = a < 0.5;
}

// A video scrubbed by scroll. Whole file is fetched once so every seek is instant.
class Scrub {
  constructor(video, duration) { this.video = video; this.duration = duration; this.ready = false; this.shown = 0; this.loading = false; }
  async load(src) {
    if (this.loading || reduceMotion || saveData) return;
    this.loading = true;
    let blob = null;
    for (let i = 0; i < 2 && !blob; i++) {
      try { const r = await fetch(src); if (r.ok) blob = await r.blob(); } catch { /* retry once */ }
    }
    if (!blob) return;
    const v = this.video;
    v.src = URL.createObjectURL(blob);
    v.load();
    try {
      await new Promise((ok, fail) => { v.addEventListener("loadeddata", ok, { once: true }); v.addEventListener("error", fail, { once: true }); });
    } catch { return; }
    v.pause();
    this.duration = v.duration || this.duration;
    v.currentTime = clamp(this.shown, 0, this.duration - 0.05);
    this.ready = true;
    v.classList.add("is-ready");
  }
  step(target, dt) {
    this.shown += (target - this.shown) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 9));
    if (Math.abs(target - this.shown) < 0.004) this.shown = target;
    const v = this.video;
    if (this.ready && !v.seeking) {
      const want = clamp(this.shown, 0, this.duration - 0.05);
      if (Math.abs(v.currentTime - want) > 0.015) v.currentTime = want;
    }
    return this.shown;
  }
}

/* ---------- 1. Hero and process film ---------- */
const film = $("#film");
const filmStage = $(".film__stage", film);
const filmScrub = new Scrub($(".film__video", film), 22.13);
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
  const t = filmScrub.step(filmScrub.duration * progressOf(film), dt);
  const portrait = innerWidth / innerHeight < 1.2;
  filmStage.style.setProperty("--ox", portrait ? `${focusAt(t).toFixed(1)}%` : "50%");
  filmStage.style.setProperty("--heat", clamp(1 - Math.abs(t - 7) / 4, 0, 1).toFixed(3));
  filmStage.style.setProperty("--wash", clamp(1 - t / 1.8, 0, 1).toFixed(3));
  for (const { el, cfg } of caps) show(el, fadeIn(t, cfg.from, cfg.to, cfg.fade));
  if (!filmScrub.ready) {
    let idx = 0;
    STILL_AT.forEach((s, i) => { if (t >= s - 1.5) idx = i; });
    if (idx !== lastStill) { stills.forEach((img, i) => img.classList.toggle("is-on", i === idx)); lastStill = idx; }
  } else if (lastStill !== -2) { stills.forEach((img) => img.classList.remove("is-on")); lastStill = -2; }
}
const startFilm = () => filmScrub.load(innerWidth < 900 ? "assets/film/film-960.mp4" : "assets/film/film-1280.mp4");
if (document.readyState === "complete") startFilm(); else addEventListener("load", startFilm, { once: true });

/* ---------- 2. 3D showcase ---------- */
const STOPS = [
  { litres: "0.6 L", dims: "Up to Ø 65 × 250 mm", model: "RL-12", cav: "12", bph: "24,000 BPH", machine: 0 },
  { litres: "2 L", dims: "Up to Ø 95 × 320 mm", model: "RL-6II", cav: "6", bph: "12,000 BPH", machine: 0 },
  { litres: "5 L", dims: "Up to Ø 180 × 360 mm", model: "RL-4-5L", cav: "4", bph: "On request", machine: 1 },
  { litres: "20 L", dims: "Up to Ø 300 × 550 mm", model: "RL-2-20L", cav: "2", bph: "1,200 BPH", machine: 1 },
  { litres: "30 L", dims: "Up to Ø 290 × 600 mm", model: "RL-1-30L", cav: "1", bph: "300 BPH", machine: 1 },
];
const MACHINES = [
  { src: "assets/models/tecblow-rl12.glb", photo: "assets/img/bottle-machine-0.webp", shown: "TEC BLOW RL-12" },
  { src: "assets/models/tecblow-large.glb", photo: "assets/img/bottle-machine-1.webp", shown: "the large-container TEC BLOW pictured on Aoktac's RL-1 and RL-2 pages" },
];
const showSec = $("#machines");
const showStage = $(".show__stage", showSec);
const ui = {
  litres: $("#show-litres"), dims: $("#show-dims"), model: $("#show-model"), cav: $("#show-cav"),
  bph: $("#show-bph"), cta: $("#show-cta"), credit: $("#show-credit"), fallback: $(".show__machine .show__fallback", showSec),
  stops: $$(".show__scale button", showSec), bottleImg: $(".show__bottle-img", showSec),
};
let showcase = null, showcaseLoading = false, showIndex = -1, showStageVal = 0;
const hasWebGL = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } })();
if (!hasWebGL) showSec.classList.add("no-webgl");

// Scroll progress holds on each size, then moves to the next.
function stageFromProgress(p) {
  const n = STOPS.length - 1, x = p * n, i = Math.min(n - 1, Math.floor(x)), f = x - i;
  return i + smooth(0.3, 0.75, f);
}
function setShowIndex(i) {
  if (i === showIndex) return;
  showIndex = i;
  const s = STOPS[i];
  ui.litres.textContent = s.litres;
  ui.dims.textContent = s.dims;
  ui.model.textContent = `TEC BLOW ${s.model}`;
  ui.cav.textContent = s.cav;
  ui.bph.textContent = s.bph;
  const m = MACHINES[s.machine];
  const medium = showSec.classList.contains("no-webgl") ? "Render of the 3D model" : "3D model";
  ui.credit.textContent = `Shown: ${m.shown}. ${medium} made from Aoktac's product photo, not to scale with the bottle.`;
  if (ui.bottleImg) ui.bottleImg.src = `assets/img/bottle-${i}.webp`;
  ui.cta.dataset.model = s.model;
  ui.cta.dataset.size = s.litres;
  if (ui.fallback.getAttribute("src") !== MACHINES[s.machine].photo) ui.fallback.src = MACHINES[s.machine].photo;
  ui.stops.forEach((b, k) => { if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
  if (!reduceMotion) {
    for (const el of [ui.litres, ui.model]) {
      el.getAnimations().forEach((a) => a.cancel());
      el.animate([{ opacity: 0.2, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });
    }
  }
}
async function initShowcase() {
  if (showcase || showcaseLoading || !hasWebGL) return;
  showcaseLoading = true;
  try {
    const { createShowcase } = await import("./showcase3d.js");
    showcase = createShowcase({
      canvas: $(".show__canvas", showSec),
      bottleSlot: $("[data-slot=bottle]", showSec),
      machineSlot: $("[data-slot=machine]", showSec),
      lowPower,
      reduced: reduceMotion,
      machines: MACHINES.map((m) => ({ src: m.src, onError: () => { showSec.classList.add("no-webgl"); showIndex = -1; } })),
    });
  } catch (err) {
    console.warn("3D showcase unavailable", err);
    showSec.classList.add("no-webgl");
    showIndex = -1;
  }
}
function paintShow(dt) {
  const near = nearView(showSec, 1);
  if (near) initShowcase();
  if (!near && !showcase) return;
  const target = stageFromProgress(progressOf(showSec));
  showStageVal += (target - showStageVal) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 8));
  setShowIndex(clamp(Math.round(showStageVal), 0, STOPS.length - 1));
  if (showcase) {
    const visible = nearView(showSec, 0.05);
    showcase.setVisible(visible);
    showcase.setStage(showStageVal);
    if (visible) showcase.frame(dt);
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
  if (hzSwipe) { hz.style.height = ""; hzTrack.style.transform = ""; return; }
  hzRun = Math.max(0, hzTrack.scrollWidth - innerWidth);
  hz.style.height = `${innerHeight + hzRun / 0.92}px`;
}
function paintHz() {
  if (hzSwipe) {
    const max = hzTrack.scrollWidth - hzTrack.clientWidth;
    hzBar.style.setProperty("--hp", max > 0 ? (hzTrack.scrollLeft / max).toFixed(3) : "0");
    return;
  }
  if (!nearView(hz, 0.2)) return;
  const raw = progressOf(hz);
  const p = clamp((raw - 0.08) / 0.92, 0, 1);   // hold the intro whole before the row moves
  hzTrack.style.transform = `translate3d(${(-p * hzRun).toFixed(1)}px,0,0)`;
  hzBar.style.setProperty("--hp", p.toFixed(3));
  // Each image drifts against its panel as it crosses the screen.
  for (const panel of hzPanels) {
    const img = panel.querySelector(".hz__media img");
    if (!img) continue;
    const r = panel.getBoundingClientRect();
    const off = ((r.left + r.width / 2) - innerWidth / 2) / innerWidth;
    img.style.setProperty("--sx", `${(-off * 40).toFixed(1)}px`);
  }
}
if (canHover && !reduceMotion) {
  for (const panel of $$("[data-tilt]")) {
    const img = panel.querySelector("img");
    panel.addEventListener("pointermove", (e) => {
      const r = panel.getBoundingClientRect();
      img.style.setProperty("--px", `${(((e.clientX - r.left) / r.width) - 0.5) * -18}px`);
      img.style.setProperty("--py", `${(((e.clientY - r.top) / r.height) - 0.5) * -14}px`);
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
const facScrub = new Scrub($(".fac__video", fac), 10);
const facPoster = $(".fac__poster", fac);
const beats = $$(".fac__beat", fac);
const BEATS = [[0, 0.2], [0.28, 0.46], [0.54, 0.72], [0.8, 1.2]];
const facPortrait = () => innerWidth / innerHeight < 0.9;
if (facPortrait()) facPoster.src = "assets/film/factory-poster-p.webp";
function paintFac(dt) {
  if (nearView(fac, 1)) facScrub.load(facPortrait() ? "assets/film/factory-720p.mp4" : "assets/film/factory-1280.mp4");
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
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const a = check(nameIn, "q-name-err", (v) => v.length > 1);
  const b = check(emailIn, "q-email-err", emailOk);
  if (!a || !b) { status.className = "quote__status"; status.textContent = "Check the highlighted fields."; (!a ? nameIn : emailIn).focus(); return; }
  status.className = "quote__status is-ok";
  status.textContent = "Demo only: on the live site this request goes to sales@aoktac.com.";
});
