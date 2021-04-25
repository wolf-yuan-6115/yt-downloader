let videoData = null, url = null;

document.getElementById("download").onclick = function () {
  document.getElementById("download").innerHTML = '<div class="mdui-spinner"></div>';
  mdui.mutation();
  window.dispatchEvent(new CustomEvent("getInfo", { detail: document.getElementById("url").value}));
  url = document.getElementById("url").value;
}

window.addEventListener("infoReceived", function (data) {
  document.getElementById("download").innerHTML = "下載";
  if (data.detail.error) {
    if (data.detail.status === 1) {
      mdui.snackbar("網址無效!", {
        position: "right-bottom"
      });
    } else {
      mdui.snackbar("無法下載直播影片!", {
        position: "right-bottom"
      });
    }
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
  if (event.detail === "done") {
    let attr = document.getElementById("download").getAttributeNode("disabled");
    document.getElementById("download").removeAttributeNode(attr);
    document.getElementById("downloadProgress").classList.add("mdui-hidden");
    mdui.alert("下載程序已經完成，檔案已保存在放置此程式資料夾中的download資料夾", "下載完成");
  } else {
    let attr = document.createAttribute("disabled");
    document.getElementById("download").setAttributeNode(attr);
    document.getElementById("downloadProgress").classList.remove("mdui-hidden");
    document.getElementById("downloadDialogProgress").style.width = `${event.detail}%`;
  }
});