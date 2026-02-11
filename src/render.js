let configTimes = [];
let originalValues = [];
let interval = null;

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
    originalValues.push(value); // guardamos copia exacta
  }

  return true;
}

function checkTime() {
  const now = new Date();

  configTimes.forEach((cfg, index) => {
    let target = new Date(now);

    target.setMinutes(cfg.min);
    target.setSeconds(cfg.sec);
    target.setMilliseconds(0);

    if (target <= now) {
      target.setHours(target.getHours() + 1);
    }

    const diff = Math.floor((target - now) / 1000);

    const input = document.getElementById("t" + index);
    if (input) {
      input.value = formatTime(diff);
    }
  });
}

function start() {
  if (!saveConfig()) return;

  // bloquear edición
  for (let i = 0; i < 6; i++) {
    document.getElementById("t" + i).disabled = true;
  }

  if (!interval) {
    checkTime();
    interval = setInterval(checkTime, 1000);
  }
}

function stop() {
  clearInterval(interval);
  interval = null;

  // restaurar valores originales
  for (let i = 0; i < 6; i++) {
    const input = document.getElementById("t" + i);
    input.disabled = false;
    input.value = originalValues[i] || "00:00";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", start);
  document.getElementById("stopBtn").addEventListener("click", stop);
  document.getElementById("saveBtn").addEventListener("click", saveConfig);
});
