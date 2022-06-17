1. Install the `electron` package into your app's devDependencies.
```
$ npm install --save-dev electron
```
2. In the scripts field of your `package.json` config, add a start command like so:
```json
{
  "scripts": {
    "start": "electron ."
  }
}
```
3. Create an empty file named `main.js` in the root folder of your project.

This will be the entry point of the Electron application. This script controls the main process, which runs in a full Node.js environment and is responsible for controlling your app's lifecycle, displaying native interfaces, performing privileged operations, and managing renderer processes.

4. To use the electron module, add the following line in the `main.js` file: 
```javascript
const { app, BrowserWindow } = require("electron")
```
+ The `app` module controls the application event lifecycle.
+ The `BrowserWindow` module creates and manages application windows.

5. Then, add a `loadMainWindow` function that loads the app url into a new BrowserWindow instance. 
An example of this function is:
```javascript
const loadMainWindow = () => {
    let mainWindow = new BrowserWindow({
        width : 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadURL('http://localhost:8000/home')
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}
```

To open the app window, listen for the `ready` event and call this function, like so:
```javascript
app.on("ready", loadMainWindow)
```

6. To quit the app when all windows are closed (only in Window and Linux), listen for the app module's `window-all-closed` event, and call `app.quit()` if the user is not on macOS (darwin).

```javascript
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
})
```

7. To open a window if none are open (only in macOS), listen for the app module's activate event, and call your existing `loadMainWindow` method if no browser windows are open.
```javascript
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow();
    }
})
```

8. To start your app in development mode use the command:
```
npm start
```