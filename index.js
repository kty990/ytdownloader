const { app, BrowserWindow, Menu, dialog, ipcMain, autoUpdater } = require('electron');
const path = require('path');
const fs = require('fs');
const download = require('./src/js/download');

let devToolsOpened = false;

class Coroutine {
    constructor(callback) {
        this.callback = callback;
        this.onError = (error) => console.error(`Coroutine Error: ${error}`);
        this.isRunning = false;
        this.generator = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.generator = this.callback(); // Recreate the generator
            this.resume();
            // console.log(`Coroutine started!`);
        }
    }

    stop() {
        this.isRunning = false;
        // console.log(`Coroutine stopped!`);
    }

    resume() {
        if (!this.isRunning) return;

        try {
            const { value, done } = this.generator.next();

            if (!done) {
                // Schedule the next iteration of the generator
                setTimeout(() => this.resume(), 0);
            }
        } catch (error) {
            // Handle errors using the onError function
            this.onError(`Error: ${error}`);
            this.stop(); // Stop the coroutine on error
        }
    }
}

class GraphicsWindow {
    constructor() {
        try {
            this.window = null;
            this.current_z_index = 0;
            this.layers = []; // List to store layers
            this.active_layer = null; // Currently active layer

            this.currentProject = null;

            app.on('ready', () => {
                this.createWindow();
            });
        } catch (e) { }
    }

    async createWindow() {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 800,   // Set the minimum width
            minHeight: 600,  // Set the minimum height
            // maxHeight: 600,
            // maxWidth: 800,
            // resizable: false,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                spellcheck: false,
                preload: path.join(__dirname, 'preload.js')
            },
        });

        // this.window.webContents.openDevTools();

        // Set the window icon
        const iconPath = path.join(__dirname, '../images/logo.png');
        this.window.setIcon(iconPath);

        const menu = Menu.buildFromTemplate([]);
        Menu.setApplicationMenu(menu);

        this.window.setMenu(menu);

        this.window.loadFile('../html/home.html');

        this.window.on('closed', () => {
            this.window = null;
        });

    }
}

const graphicsWindow = new GraphicsWindow();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


if (process.platform === 'win32') {
    app.setAppUserModelId('total_task');
}

autoUpdater.setFeedURL({
    url: 'https://github.com/kty990/discordbotmaker/releases'
});

ipcMain.on("dev-refresh", () => {
    graphicsWindow.window.reload();
})

ipcMain.on("close", () => {
    graphicsWindow.window.close();
})

ipcMain.on("minimize", () => {
    graphicsWindow.window.minimize();
})

ipcMain.on("toggle-dev-tools", () => {

    // Toggle the DevTools visibility based on its current state
    if (devToolsOpened) {
        graphicsWindow.window.webContents.closeDevTools();
    } else {
        graphicsWindow.window.webContents.openDevTools({ reload: false })
    }
})

ipcMain.on("download", (ev, data) => {
    let url = data;
    console.log("Downloading...");
    download.download(graphicsWindow.window, url);
})

// --------------------------------------------------------------------------------------------------
// ==================================================================================================
// --------------------------------------------------------------------------------------------------

const cache = {};

ipcMain.on("edit-cache", (ev, data) => {
    const { key, value } = data;
    cache[key] = value;
})

ipcMain.on("get-cache", (ev, data) => {
    const { key } = data;
    graphicsWindow.window.webContents.send("get-cache", cache[key]);
})