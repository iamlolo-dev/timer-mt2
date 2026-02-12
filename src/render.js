const Store = require('electron-store');
const store = new Store();

const alertSound = new Audio("../assets/alert.mp3");
const preSound = new Audio("../assets/prealert.mp3");

let lastTrigger = {};
let configTimes = [];
let originalValues = [];
let interval = null;

// 👇 Cargar tiempos guardados o usar 00:00 por defecto
let savedTimes = store.get("times") || [
  "00:00","00:00","00:00",
  "00:00","00:00","00:00"
];

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

function saveConfig() {
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

  store.set("times", originalValues);
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

    // 🔔 PRE ALERT EXACTO -35s
    if (
      diff === 35 &&
      lastTrigger[index] !== "pre-" + target.getHours()
    ) {
      preSound.currentTime = 0;
      preSound.play();
      lastTrigger[index] = "pre-" + target.getHours();
    }

    // 🔔 ALERTA EXACTA
    if (
      diff === 0 &&
      lastTrigger[index] !== "main-" + target.getHours()
    ) {
      alertSound.currentTime = 0;
      alertSound.play();
      lastTrigger[index] = "main-" + target.getHours();
    }

    if (input) {
      input.value = formatTime(diff);
    }

  });
}

// 🔥 TICK SINCRONIZADO CON EL RELOJ REAL
function preciseTick() {
  checkTime();

  const now = new Date();
  const msToNextSecond = 1000 - now.getMilliseconds();

  interval = setTimeout(preciseTick, msToNextSecond);
}

function start() {
  if (!saveConfig()) return;

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

document.addEventListener("DOMContentLoaded", () => {

  for (let i = 0; i < 6; i++) {
    document.getElementById("t" + i).value = savedTimes[i];
  }

  document.getElementById("startBtn").addEventListener("click", start);
  document.getElementById("stopBtn").addEventListener("click", stop);
  document.getElementById("saveBtn").addEventListener("click", saveConfig);
});
