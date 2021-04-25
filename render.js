let videoData = null, url = null, state = false;

document.getElementById("download").onclick = function () {
  document.getElementById("download").innerHTML = '<div class="mdui-spinner"></div>';
  mdui.mutation();
  window.dispatchEvent(new CustomEvent("getInfo", { detail: document.getElementById("url").value}));
  url = document.getElementById("url").value;
}

window.addEventListener("infoReceived", function (data) {
  document.getElementById("download").innerHTML = "下載";
  if (data.detail.error) {
    mdui.snackbar("網址無效!", {
      position: "right-bottom"
    });
  } else {
    mdui.alert(`即將開始下載${data.detail.videoDetails.title}`, "確認下載?", function () {
      videoData = data.detail;
      videoData.url = url;
      videoData.downloadFormat = document.getElementById("format").selectedIndex + 1;
      window.dispatchEvent(new CustomEvent("startDownload", { detail: videoData }));
    })
  }
});

window.addEventListener("progress", function (event) {
  let downloadDialog = new mdui.Dialog(document.getElementById("downloadProgress"));
  if (event.detail === "done" && state) {
    downloadDialog.close();
    state = false;
  } else {
    if (!downloadDialog.isOpen()) downloadDialog.open();
    state = true;
    document.getElementById("downloadDialogProgress").style.width = `${event.detail}%`;
    downloadDialog.handleUpdate();
  }
});