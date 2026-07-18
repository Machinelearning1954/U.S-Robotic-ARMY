// Boot + screen navigation for REZONANCE.
import { Game } from "./game.js";
import { Cutscene } from "./cutscene.js";

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
};

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
