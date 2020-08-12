const {
  app,
  BrowserWindow
} = require('electron');
const path = require('path');
const {ipcMain} = require('electron');
const http = require('http');

const processInformation = require(path.join(__dirname, "stateProcessing.js"));

const port = 6928;

require(path.join(__dirname, "stateIntegration/cfgInjection.js"))();

var mainWindow;

server = http.createServer(function (req, res) {
  if (req.method == 'POST') {
    console.log("Incoming POST");
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      console.log(body);
      mainWindow.webContents.send("stateUpdate", processInformation(JSON.parse(body)));
      res.end('');
    });
  }
});

server.listen(port, "127.0.0.1");

if (require('electron-squirrel-startup')) {
  app.quit();
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
    transparent: true,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.maximize();
  mainWindow.setMenu(null);

  //mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});