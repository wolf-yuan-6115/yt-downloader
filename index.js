const {
  app,
  BrowserWindow,
  ipcMain,
  shell
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
    minWidth: 550,
    minHeight: 400,
    maximizable: true,
    webPreferences: {
      preload: join(__dirname, "preload.js")
    },
    icon: "./icon.png"
  });

  mainWindow.loadFile("app.html");
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
  if (!ytdl.validateURL(arg)) return { error: true, status: 1 };
  let data = await ytdl.getInfo(arg);
  if (data.videoDetails.lengthSeconds == 0) return { error: true, status: 2 };
  else return data;
});

ipcMain.handle("startDownload", async (event, arg) => {
  if (!ytdl.validateURL(arg.url)) return { error: true, status: 1 };
  try {
    let stream = await ytdl(arg.url, {
      highWaterMark: 1 << 25,
      dlChunkSize: 0
    });
    stream.on("progress", (chunkSize, downloaded, total) => {
      let prog = (downloaded / total) * 100;
      mainWindow.webContents.send("progress", prog);
    });
    if (!fs.existsSync("./download")){
      fs.mkdirSync("./download");
    }
    if (arg.downloadFormat === 1) {
      ytdlRender.arbitraryStream(stream, {
        fmt: "mp3",
        opusEncoded: false
      })
        .pipe(fs.createWriteStream(join(__dirname, "download", `${arg.videoDetails.title}.mp3`)))
        .on("close", () => {
          mainWindow.webContents.send("progress", "done");
        });
    } else {
      stream
        .pipe(fs.createWriteStream(join(__dirname, "download", `${arg.videoDetails.title}.mp4`)))
        .on("close", () => {
          mainWindow.webContents.send("progress", "done");
        });
    }
  } catch (e) {
    console.log(e);
    return { error: true, status: 2 };
  }
});