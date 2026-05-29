const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 550,
        height: 700,
        resizable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    
    // Opcional: quitar advertencias de seguridad en desarrollo
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
    
    win.loadFile('index.html');
    win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});