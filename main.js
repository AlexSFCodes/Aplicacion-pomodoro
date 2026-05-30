const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let win = null;
let tray = null;

function createWindow() {
    win = new BrowserWindow({
        width: 550,
        height: 700,
        resizable: true,
        icon: path.join(__dirname, 'logo.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false
        }
    });
    
   
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
    
    win.loadFile('index.html');
    win.setMenuBarVisibility(false);

    // Evitar que la aplicación se cierre al darle a la X
    win.on('close', function (event) {
        if (!app.isQuiting) {
            event.preventDefault();
            win.hide();
        }
        return false;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Crear el icono en la bandeja del sistema (segundo plano)
    tray = new Tray(path.join(__dirname, 'logo.ico'));
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Mostrar Pomodoro', click: () => win.show() },
        { label: 'Salir', click: () => { 
            app.isQuiting = true; 
            app.quit(); 
        }}
    ]);
    
    tray.setToolTip('Pomodoro App');
    tray.setContextMenu(contextMenu);
    
    // Mostrar la app al hacer click en el icono
    tray.on('click', () => {
        win.show();
    });
});

app.on('window-all-closed', () => {
    // No hacer nada para que se mantenga en segundo plano
});