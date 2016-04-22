var path = require("path");
var fs = require("fs");
var shelljs = require("shelljs");

module.exports = function(logger, platformsData, projectData, hookArgs) {
    var platformAppDirectory = path.join(platformsData.platformsData[hookArgs.platform].appDestinationDirectoryPath, "app");
    var platformPluginDirectory = path.join(platformAppDirectory, "tns_modules/nativescript-angular-snapshot");

    if (hookArgs.platform !== "android") {
        shelljs.rm("-rf", platformPluginDirectory);
        return;
    }

    var pluginDirectory = path.join(projectData.projectDir, "node_modules/nativescript-angular-snapshot");

    shelljs.cp(path.join(pluginDirectory, "_embedded_script_.android.js"), path.join(platformAppDirectory, "_embedded_script_.js"));
    shelljs.rm("-f", path.join(platformPluginDirectory, "_embedded_script_.js"));

    shelljs.cp(path.join(pluginDirectory, "tns-java-classes.android.js"), path.join(platformAppDirectory, "tns-java-classes.js"));
    shelljs.rm("-f", path.join(platformPluginDirectory, "tns-java-classes.js"));

    shelljs.rm("-rf", path.join(platformPluginDirectory, "node_modules"));

    var appPackageJSONPath = path.join(platformAppDirectory, "package.json");
    var appPackageJSON = JSON.parse(fs.readFileSync(appPackageJSONPath, 'utf8'));

    if (!(appPackageJSON["android"] && appPackageJSON["android"]["heapSnapshotScript"])) {
        appPackageJSON["android"] = appPackageJSON["android"] || {};
        appPackageJSON["android"]["heapSnapshot"] = "true";
        appPackageJSON["android"]["heapSnapshotBlob"] = "tns_modules/nativescript-angular-snapshot/snapshots/";
    }

    fs.writeFileSync(appPackageJSONPath, JSON.stringify(appPackageJSON, null, 2));
};
