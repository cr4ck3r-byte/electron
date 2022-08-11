const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('path');
const {download} = require('electron-dl');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile('index.html')
    ipcMain.on("download", (event, info) => {
        info.properties.onProgress = status => win.webContents.send("download progress", status);
        download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
        .then(dl =>win.webContents.send("download complete", dl.getSavePath()))
        .catch(e => win.webContents.send("download error", e))
    }) 
}

app.whenReady().then(() => {
    createWindow()

    app.on('window-all-closed', () => {
        if(process.platform !== 'darwin') app.quit()
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
