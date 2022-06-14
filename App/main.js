const { app, BrowserWindow } = require("electron")

const server = require('./server/server')
server.build_app('-client')

const loadMainWindow = () => {
    let mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.maximize()
    mainWindow.loadURL('http://localhost:8000/home')
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on("ready", loadMainWindow)

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow()
    }
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
})