var path = require("path");
var fs = require("fs");
var shelljs = require("shelljs");
var semver = require("semver");
var common = require("./common");

var MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT = "2.1.0";

module.exports = function(logger, platformsData, projectData, hookArgs) {
    common.executeInProjectDir(projectData.projectDir, function() {
        var platformAppDirectory = path.join(platformsData.platformsData[hookArgs.platform].appDestinationDirectoryPath, "app");

        if (!common.isSnapshotEnabled(projectData, hookArgs)) {
            if (hookArgs.platform === "android") {
                // Force the CLI to return the deleted packages
                if (!shelljs.test("-e", path.join(platformAppDirectory, "tns_modules/application"))) {
                    shelljs.touch("-c", path.join(projectData.projectDir, "node_modules/nativescript-angular/package.json"));
                    shelljs.touch("-c", path.join(projectData.projectDir, "node_modules/tns-core-modules/package.json"));
                }

                shelljs.rm("-rf", path.join(platformAppDirectory, "../snapshots"));
            }
            return;
        }

        var currentRuntimeVersion = common.getAndroidRuntimeVersion(projectData);
        if (!currentRuntimeVersion) {
            throw new Error("You must have the \"android\" platform installed.");
        }

        if (!semver.gte(currentRuntimeVersion, MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT)) {
            throw new Error("In order to support heap snapshots, you must have at least tns-android@" + MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT +
                " installed. Current Android Runtime version is: " + currentRuntimeVersion + ".");
        }

        var isAngularApp = common.isAngularInstalled(projectData);
        var requiredSnapshotPackage = common.getSnapshotPackage(projectData, isAngularApp);

        if (!isAngularApp) {
            common.uninstallPackage({ name: "nativescript-angular-snapshot" });
        } else {
            common.uninstallPackage({ name: "tns-core-modules-snapshot" });
        }

        if (!common.isPackageInstalled(requiredSnapshotPackage)) {
            logger.warn("Required heap snapshot package is not installed. Installing \"" + requiredSnapshotPackage.name + "@" + requiredSnapshotPackage.version + "\".");

            if (!common.isPackagePublished(requiredSnapshotPackage)) {
                var dispatcherPluginName = require("../package.json").name;
                throw new Error("Could not find package \"" + requiredSnapshotPackage.name + "@" + requiredSnapshotPackage.version + "\" in the registry.\n" +
                    "You can install it manually or remove the \"" + dispatcherPluginName + "\" plugin and continue building without heap snapshots.");
            }

            common.installPublishedPackage(logger, requiredSnapshotPackage);
        }
    });
};
