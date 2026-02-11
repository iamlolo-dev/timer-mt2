const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require("electron-updater");
const path = require('path');
const log = require("electron-log");
log.transports.file.level = "info";
log.info("APP STARTED");

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 👇 ESTA ES LA FORMA CORRECTA
  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // 👇 abre consola para debug
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  log.info("Checking for updates...");

  createWindow();

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.checkForUpdates();

});

autoUpdater.on("checking-for-update", () => {
  log.info("Checking for update...");
});

autoUpdater.on("update-available", () => {
  log.info("Update available!");
});

autoUpdater.on("update-not-available", () => {
  log.info("No updates found.");
});

autoUpdater.on("error", (err) => {
  log.error("Updater error:", err);
});


autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Actualización disponible",
    message: "Se está descargando una nueva versión..."
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Actualización lista",
    message: "La app se cerrará para actualizar."
  }).then(() => {
    autoUpdater.quitAndInstall();
  });
});

autoUpdater.on("error", (err) => {
  console.log("Updater error:", err);
});


