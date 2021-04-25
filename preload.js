/*
 * This script will send event from front-end to back-end.
 */
const { ipcRenderer } = require("electron");

window.addEventListener("getInfo", function (data) {
  ipcRenderer.invoke("getVideoData", data.detail)
    .then(res => {
      window.dispatchEvent(new CustomEvent("infoReceived", { detail: res }));
    });
});

window.addEventListener("startDownload", function (data) {
  ipcRenderer.invoke("startDownload", data.detail)
    .then(res => {
      console.log(res);
    })
});

ipcRenderer.on("progress", (event, status) => {
  if (status === "done") {
    window.dispatchEvent(new CustomEvent("progress", { detail: "done" }));
  } else {
    window.dispatchEvent(new CustomEvent("progress", { detail: status }))
  }
});



