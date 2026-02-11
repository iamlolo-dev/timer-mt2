const { app, BrowserWindow } = require('electron');
const path = require('path');

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

app.whenReady().then(createWindow);
