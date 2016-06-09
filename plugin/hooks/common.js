var path = require("path");
var fs = require("fs");
var shelljs = require("shelljs");
var child_process = require("child_process");

exports.environmentVariableToggleKey = "TNS_ANDROID_SNAPSHOT";

exports.isSnapshotEnabled = function(projectData, hookArgs) {
    if (hookArgs.platform !== "android") {
        return false;
    }

    if (process.env[exports.environmentVariableToggleKey] === "0") {
        return false;
    }

    if (projectData.$options.release || process.env[exports.environmentVariableToggleKey]) {
        return true;
    }

    return false;
};

exports.isAngularInstalled = function(projectData) {
    return shelljs.test("-e", path.join(projectData.projectDir, "node_modules/nativescript-angular"));
};

function calculateV8Version(runtimeVersion) {
    // TODO: Extend this logic when we publish newer V8 versions
    return "4.7.80";
}

exports.getAndroidRuntimeVersion = function(projectData) {
    try {
        var appPackageJSON = JSON.parse(fs.readFileSync(projectData.projectFilePath, "utf8"));
        var version = appPackageJSON["nativescript"]["tns-android"]["version"];
        return version.replace(/\-.*/, "");
    } catch(e) {
        return null;
    }
};

exports.getSnapshotPackage = function(projectData, isAngularApp) {
    var packageName = isAngularApp ? "nativescript-angular" : "tns-core-modules";
    var packageJSON = JSON.parse(fs.readFileSync(path.join(projectData.projectDir, "node_modules", packageName, "package.json"), "utf8"));

    var runtimeVersion = exports.getAndroidRuntimeVersion(projectData);

    return {
        originalName: packageJSON.name,
        name: packageJSON.name + "-snapshot",
        version: packageJSON.version + "-" + calculateV8Version(runtimeVersion),
    };
};

exports.isPackageInstalled = function(packageInfo) {
    var npmSnapshotPackageInfo = JSON.parse(child_process.spawnSync("npm", ["ls", "--json", packageInfo.name + "@" + packageInfo.version]).stdout.toString("utf8"));
    if (!npmSnapshotPackageInfo.dependencies) {
        return false;
    }

    return true;
};

exports.isPackagePublished = function(packageInfo) {
    var proc = child_process.spawnSync("npm", ["view", "--json", packageInfo.name, "versions"]);
    if (proc.status !== 0) {
        return false;
    }

    var publishedSnapshotPackageVersions = JSON.parse(proc.stdout.toString("utf8"));

    if (typeof publishedSnapshotPackageVersions === "string") {
        if (publishedSnapshotPackageVersions === packageInfo.version) {
            return true;
        }
    } else {
        for (var i = 0; i < publishedSnapshotPackageVersions.length; i++) {
            if (publishedSnapshotPackageVersions[i] === packageInfo.version) {
                return true;
            }
        }
    }

    return false;
};

exports.installPublishedPackage = function(packageInfo) {
    var proc = child_process.spawnSync("npm", ["install", packageInfo.name + "@" + packageInfo.version]);
    if (proc.status !== 0) {
        throw new Error("Failed to install package \"" + packageInfo.name + "@" + packageInfo.version + "\".");
    }
};

exports.uninstallPackage = function(packageInfo) {
    child_process.spawnSync("npm", ["uninstall", packageInfo.name]);
};
