const { app, BrowserWindow } = require('electron');
require('./dist/server.cjs'); // Starts the server

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    title: "Radio Shop Dashboard"
  });
  
  // Load the local running Express server
  setTimeout(() => {
    win.loadURL('http://localhost:3000');
  }, 1000);
}

app.whenReady().then(createWindow);