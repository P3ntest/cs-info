const path = require("path");
const {
    enumerateValues,
    HKEY,
    RegistryValueType
} = require("registry-js");
const fs = require("fs");
const vdf = require('simple-vdf');
const {
    get
} = require("http");

const localCfg = path.join(__dirname, "foo.cfg");

//steamid csgo = 730

function locateSteamInstallPath() {
    let allValues = enumerateValues(HKEY.HKEY_LOCAL_MACHINE, 'SOFTWARE\\WOW6432Node\\Valve\\Steam');
    if (allValues.length == 0) {
        console.log("Detected 32-Bit System!");
        allValues = enumerateValues(HKEY.HKEY_LOCAL_MACHINE, 'SOFTWARE\\Valve\\Steam');
    }

    let installPathProperty = allValues.filter(obj => {
        return obj.name == "InstallPath"
    });

    return installPathProperty[0].data;
}

function getAllSteamLibrarys() {
    let defaultSteamApps = path.join(locateSteamInstallPath(), "/steamapps");
    let librarys = [defaultSteamApps];
    //libraryfolders.vdf
    let libraryFoldersFile = fs.readFileSync(path.join(defaultSteamApps, "libraryfolders.vdf"), "utf-8");
    let libraryFoldersRaw = vdf.parse(libraryFoldersFile).LibraryFolders;
    let libaryFolders = Object.keys(libraryFoldersRaw)
        .filter(key => !isNaN(key))
        .reduce((obj, key) => {
            obj[key] = libraryFoldersRaw[key];
            return obj;
        }, {});
    Object.keys(libaryFolders).forEach((key) => {
        librarys.push(path.join(libaryFolders[key], "steamapps"));
    });
    return librarys;
}

function findCsgoCfgFolder() {
    let librarys = getAllSteamLibrarys();
    let library;
    librarys.forEach(lib => {
        if (fs.existsSync(path.join(lib, "appmanifest_730.acf"))) {
            library = lib;
        }
    });
    if (library == undefined) {
        return undefined;
    }
    return path.join(library, "common/Counter-Strike Global Offensive/csgo/cfg");
}

function injectConfigFile() {
    cfgFolder = findCsgoCfgFolder();
    let destinationPath = path.join(cfgFolder, "gamestate_integration_csinfo.cfg");
    if (!fs.existsSync(destinationPath)) {
        fs.copyFileSync(path.join(__dirname, "gamestate_integration_csinfo.cfg"), destinationPath);
        console.log("Injected cfg file.");
    }
}

const injectCfg = () => {
    setTimeout(injectConfigFile);
};

module.exports = injectCfg;