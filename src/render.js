const { ipcRenderer } = require("electron");

let lastTrigger = {};
let configTimes = [];
let originalValues = [];
let interval = null;
let savedTimes = [];

let alertSound;
let preSound;

async function loadTimes() {
  savedTimes = await ipcRenderer.invoke("get-times");

  for (let i = 0; i < 6; i++) {
    const input = document.getElementById("t" + i);
    if (input) {
      input.value = savedTimes[i];
    }
  }
}

async function saveTimes(times) {
  await ipcRenderer.invoke("set-times", times);
}

function parseTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [min, sec] = value.split(":").map(Number);
  if (min > 59 || sec > 59) return null;
  return { min, sec };
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
}

async function saveConfig() {
  configTimes = [];
  originalValues = [];

  for (let i = 0; i < 6; i++) {
    const input = document.getElementById("t" + i);
    const value = input.value;

    const parsed = parseTime(value);
    if (!parsed) {
      alert("Formato inválido. Usa MM:SS (00-59)");
      return false;
    }

    configTimes.push(parsed);
    originalValues.push(value);
  }

  await saveTimes(originalValues); // 🔥 guardamos via IPC
  return true;
}

function checkTime() {
  const now = new Date();

  configTimes.forEach((cfg, index) => {

    const input = document.getElementById("t" + index);

    let target = new Date(now);
    target.setMinutes(cfg.min);
    target.setSeconds(cfg.sec);
    target.setMilliseconds(0);

    if (target <= now) {
      target.setHours(target.getHours() + 1);
    }

    const diff = Math.floor((target - now) / 1000);

    if (diff === 35 && lastTrigger[index] !== "pre-" + target.getHours()) {
      preSound.currentTime = 0;
      preSound.play();
      lastTrigger[index] = "pre-" + target.getHours();
    }

    if (diff === 0 && lastTrigger[index] !== "main-" + target.getHours()) {
      alertSound.currentTime = 0;
      alertSound.play();
      lastTrigger[index] = "main-" + target.getHours();
    }

    const formatted = formatTime(diff);
    if (input && input.value !== formatted) {
      input.value = formatted;
    }
  });
}

function preciseTick() {
  const start = Date.now();
  checkTime();
  const drift = Date.now() - start;

  interval = setTimeout(preciseTick, Math.max(0, 1000 - drift));
}

async function start() {
  if (!(await saveConfig())) return;

  alertSound = new Audio("../assets/alert.mp3");
  preSound = new Audio("../assets/prealert.mp3");

  for (let i = 0; i < 6; i++) {
    document.getElementById("t" + i).disabled = true;
  }

  if (!interval) {
    preciseTick();
  }
}

function stop() {
  clearTimeout(interval);
  interval = null;

  for (let i = 0; i < 6; i++) {
    const input = document.getElementById("t" + i);
    input.disabled = false;
    input.value = originalValues[i] || savedTimes[i] || "00:00";
  }
}

document.addEventListener("DOMContentLoaded", async () => {

  await loadTimes(); // 🔥 cargamos desde main

  document.getElementById("startBtn").addEventListener("click", start);
  document.getElementById("stopBtn").addEventListener("click", stop);
});
