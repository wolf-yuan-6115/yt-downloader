const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const { join } = require("path");
const ytdl = require("ytdl-core");
const ytdlRender = require("discord-ytdl-core");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 550,
    height: 400,
    maximizable: true,
    webPreferences: {
      preload: join(__dirname, "preload.js")
    },
    icon: "./icon.png"
  });

  mainWindow.loadFile("app.html");
  mainWindow.webContents.openDevTools();
  mainWindow.removeMenu();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("getVideoData", async (event, arg) => {
  if (!ytdl.validateURL(arg)) return { error: true };
  let data = await ytdl.getInfo(arg);
  return data;
});

ipcMain.handle("startDownload", async (event, arg) => {
  if (!ytdl.validateURL(arg.url)) return { error: true, status: 1 };
  try {
    let stream = await ytdl(arg.url, {
      highWaterMark: 1 << 25,
      dlChunkSize: 0
    });
    stream.on("progress", (chunkSize, downloaded, total) => {
      let prog = downloaded / total;
      mainWindow.webContents.send("progress", prog);
    });
    let format = arg.downloadFormat === 1 ? "mp3" : "mp4";
    ytdlRender.arbitraryStream(stream, {
      fmt: format,
      opusEncoded: false
    })
      .pipe(fs.createWriteStream(`./download/${arg.videoDetails.title}.${format}`))
      .on("close", () => {
        mainWindow.webContents.send("progress", "done");
      });
  } catch {
    return { error: true, status: 2 };
  }
});