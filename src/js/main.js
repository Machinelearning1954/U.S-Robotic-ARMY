// Boot + screen navigation for REZONANCE.
import { Game } from "./game.js";
import { Cutscene } from "./cutscene.js";
import { audio } from "./audio.js";

// Browsers only allow audio to start inside a user gesture.
const tryUnlock = () => audio.unlock();
window.addEventListener("pointerdown", tryUnlock);
window.addEventListener("keydown", tryUnlock);

// Title key art: prefer a local copy in src/assets/, fall back to the
// hosted original, and if both fail the CSS-only title stands on its own.
const KEYART_SOURCES = [
  "src/assets/keyart.png",
  // Vesper key art — Higgsfield soul_2: rear three-quarter, hourglass build,
  // rain-slick neon street, logo negative space on the left.
  "https://d8j0ntlcm91z4.cloudfront.net/user_3DecqKTontO540o5h6oTceJuUaD/hf_20260720_111440_8794d366-f40c-4ec7-ae7b-c1284ea7d1e2.png",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3DecqKTontO540o5h6oTceJuUaD/hf_20260718_185334_4f64cefc-3ecc-4ae9-bf53-3f46a5873b2c.png",
];
(function loadKeyArt(i) {
  if (i >= KEYART_SOURCES.length) return;
  const img = new Image();
  img.onload = () => {
    const el = document.getElementById("titleArt");
    el.style.backgroundImage = `url("${KEYART_SOURCES[i]}")`;
    el.classList.add("loaded");
  };
  img.onerror = () => loadKeyArt(i + 1);
  img.src = KEYART_SOURCES[i];
})(0);

const screens = {
  title: document.getElementById("title"),
  how: document.getElementById("how"),
  cutscene: document.getElementById("cutscene"),
  game: document.getElementById("game"),
};

function show(name) {
  for (const s of Object.values(screens)) s.classList.remove("active");
  screens[name].classList.add("active");
}

const hud = {
  districtName: document.getElementById("districtName"),
  emitterCount: document.getElementById("emitterCount"),
  clock: document.getElementById("clock"),
  resonanceFill: document.getElementById("resonanceFill"),
  exposureFill: document.getElementById("exposureFill"),
  staminaFill: document.getElementById("staminaFill"),
  prompt: document.getElementById("prompt"),
  radio: document.getElementById("radio"),
  radioText: document.getElementById("radioText"),
  holo: document.getElementById("holo"),
};

// ---------------------------------------------------------------------------
// Graphics settings — a GTA-6-style optimization menu wired to the game's real
// renderer features (presets, per-effect toggles, an upscaler-style render
// scale, and an FPS counter). Persisted in localStorage; read live each frame
// by both the 2.5D and 3D renderers via the shared `gfx` object.
// ---------------------------------------------------------------------------
const GFX_KEY = "rez_gfx";
const gfx = {
  preset: "auto", shadows: true, reflections: true, godrays: true,
  bloom: true, grain: true, renderScale: 1, showFps: false,
};
try { Object.assign(gfx, JSON.parse(localStorage.getItem(GFX_KEY) || "{}")); } catch (e) {}
hud.gfx = gfx; // Game + Renderer3D read this

const GFX_PRESETS = {
  cinematic:   { shadows: true,  reflections: true,  godrays: true,  bloom: true,  grain: true,  renderScale: 1.0 },
  balanced:    { shadows: true,  reflections: true,  godrays: false, bloom: true,  grain: true,  renderScale: 0.85 },
  performance: { shadows: false, reflections: false, godrays: false, bloom: false, grain: false, renderScale: 0.6 },
};
const GFX_NOTES = {
  auto: "Auto adapts quality to your frame rate.",
  cinematic: "Everything on — best on a strong GPU.",
  balanced: "High detail; god rays off, 85% render scale.",
  performance: "Effects off, 60% render scale for max FPS.",
  custom: "Custom — tune each effect below.",
};
const gfxPanel = document.getElementById("gfx");
const gfxNote = document.getElementById("gfxNote");
const rsVal = document.getElementById("rsVal");
const fpsEl = document.getElementById("fps");

function saveGfx() { try { localStorage.setItem(GFX_KEY, JSON.stringify(gfx)); } catch (e) {} }
function syncGfxPanel() {
  document.querySelectorAll(".gfx-preset").forEach((b) =>
    b.classList.toggle("active", b.dataset.preset === gfx.preset));
  gfxNote.textContent = GFX_NOTES[gfx.preset] || GFX_NOTES.custom;
  const auto = gfx.preset === "auto";
  document.querySelectorAll("[data-gfx]").forEach((el) => {
    const k = el.dataset.gfx;
    if (el.type === "checkbox") el.checked = !!gfx[k];
    else if (el.type === "range") el.value = Math.round(gfx.renderScale * 100);
    // effect toggles are governed automatically in Auto mode
    const isEffect = !["showFps", "renderScale"].includes(k);
    el.closest(".gfx-row").classList.toggle("disabled", auto && isEffect);
  });
  rsVal.textContent = Math.round(gfx.renderScale * 100) + "%";
  fpsEl.hidden = !gfx.showFps;
  saveGfx();
}
function applyPreset(name) {
  if (GFX_PRESETS[name]) Object.assign(gfx, GFX_PRESETS[name]);
  gfx.preset = name;
  syncGfxPanel();
}
document.querySelectorAll(".gfx-preset").forEach((b) =>
  b.addEventListener("click", () => applyPreset(b.dataset.preset)));
document.querySelectorAll("[data-gfx]").forEach((el) =>
  el.addEventListener("input", () => {
    const k = el.dataset.gfx;
    if (el.type === "checkbox") gfx[k] = el.checked;
    else if (el.type === "range") gfx.renderScale = (+el.value) / 100;
    // flipping an actual effect drops us out of a named preset into Custom
    if (!["showFps", "renderScale"].includes(k)) gfx.preset = "custom";
    syncGfxPanel();
  }));

let gfxOpen = false;
function toggleGfx(open) {
  gfxOpen = open === undefined ? !gfxOpen : open;
  gfxPanel.classList.toggle("show", gfxOpen);
  if (game) game.uiPaused = gfxOpen; // freeze the sim but keep rendering (live preview)
  if (gfxOpen) syncGfxPanel();
}
document.getElementById("gfxBtn").addEventListener("click", () => toggleGfx());
document.getElementById("gfxClose").addEventListener("click", () => toggleGfx(false));
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "o" && screens.game.classList.contains("active")) {
    e.preventDefault(); toggleGfx();
  }
});
// FPS readout, driven off the game loop's smoothed frame time.
setInterval(() => {
  if (gfx.showFps && game && screens.game.classList.contains("active")) {
    fpsEl.textContent = (game.frameEma > 0 ? Math.round(1 / game.frameEma) : 0) + " FPS";
  }
}, 250);

const overlay = document.getElementById("overlay");
const overlayCard = overlay.querySelector(".overlay-card");
const overTitle = document.getElementById("overTitle");
const overBody = document.getElementById("overBody");
const overBtn = document.getElementById("overBtn");

let game = null;
let pendingAction = null;

function launch(districtIndex) {
  overlay.classList.remove("show");
  show("game");
  if (game) game.stop();
  game = new Game(document.getElementById("stage"), hud, handleEnd);
  game.start(districtIndex);
  window.__rez = game; // debug/testing handle
}

function handleEnd(result) {
  overlayCard.classList.remove("win", "lose");
  if (result.type === "lose") {
    overlayCard.classList.add("lose");
    overTitle.textContent = result.title;
    overBody.textContent = result.body;
    overBtn.textContent = "RETRY DISTRICT";
    pendingAction = () => launch(result.retry);
  } else if (result.type === "victory") {
    overlayCard.classList.add("win");
    overTitle.textContent = result.title;
    overBody.textContent = result.body;
    overBtn.textContent = "RETURN TO TITLE";
    pendingAction = () => { if (game) game.stop(); game = null; show("title"); };
  } else {
    overlayCard.classList.add("win");
    overTitle.textContent = result.title;
    overBody.textContent = result.body;
    overBtn.textContent = "NEXT DISTRICT";
    pendingAction = () => launch(result.next);
  }
  overlay.classList.add("show");
}

overBtn.addEventListener("click", () => { if (pendingAction) pendingAction(); });

// Intro briefing plays before the first district only.
async function beginSweep() {
  for (const s of Object.values(screens)) s.classList.remove("active");
  const cine = new Cutscene({
    screen: screens.cutscene,
    canvas: document.getElementById("cineStage"),
    video: document.getElementById("cineVideo"),
    text: document.getElementById("cineText"),
  });
  await cine.play();
  launch(0);
}

document.getElementById("startBtn").addEventListener("click", beginSweep);
document.getElementById("howBtn").addEventListener("click", () => show("how"));
document.querySelectorAll(".backBtn").forEach((b) =>
  b.addEventListener("click", () => show("title"))
);
