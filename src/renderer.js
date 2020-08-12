const {ipcRenderer} = require('electron');

const currTimeoutWarning = setTimeout(() => {});
updateTimeout();

ipcRenderer.on("stateUpdate",  (event, args) => {
    clearTimeout(currTimeoutWarning);
    document.getElementById("err-cs-not-resp").style.display = "none";
    console.log("recieved stateUpdate");
    if (args.activity === "menu") {
        console.log("is in menu!");
        disableAllActivitys();
        document.getElementById("ac-menu").style.display = "block";
    }
    document.getElementById("ac-menu").innerHTML = JSON.stringify(args, null, 1);
    updateTimeout();
});

function updateTimeout() {
    currTimeoutWarning = setTimeout(() => {
        document.getElementById("err-cs-not-resp").style.display = "block";
    }, 5000);
}

function disableAllActivitys() {
    let activitys = document.getElementsByClassName("activity");
    for (let i = 0; i < activitys.length; i++) {
        activitys[i].style.display = "none";
    }
}