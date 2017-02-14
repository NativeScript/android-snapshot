var path = require("path");
var fs = require("fs");
var os = require("os");
var shelljs = require("shelljs");

var environmentVariableToggleKey = "TNS_ANDROID_SNAPSHOT";

function getV8Version(nativeScriptRegularAar) {
    var zip = new require("adm-zip")(nativeScriptRegularAar);
    var config = zip.readAsText("config.json");
    var version = JSON.parse(config)["v8-version"];
    return version;
}

function getOSName() {
    var osId = os.type();
    if (/^darwin/.test(osId))
        return "darwin";
    if (/^linux/.test(osId))
        return "linux";
    if (/^win/.test(osId))
        return "win";
    return osId;
}

function getMksnapshotToolsPath(pluginMksnapshotRoot, nativeScriptRegularAar) {
    var v8Version = getV8Version(nativeScriptRegularAar);
    var osName = getOSName();
    return path.join(pluginMksnapshotRoot, "mksnapshot-" + v8Version, osName.toLowerCase() + "-" + os.arch());
}

exports.cleanPlatformsFolder = function(paths) {
    // Force the CLI to return the deleted packages when --syncAllFiles is true
    if (!shelljs.test("-e", path.join(paths.tnsModulesTnsCoreModules, "application"))) {
        shelljs.touch("-c", path.join(paths.nodeModuleNativeScriptAngular, "package.json"));
        shelljs.touch("-c", path.join(paths.nodeModulesTnsCoreModules, "package.json"));
    }
    // TODO: Force the CLI to return the deleted packages even when --syncAllFiles is false

    shelljs.rm("-rf", path.join(paths.platformApp, "_embedded_script_.js"));
    shelljs.rm("-rf", path.join(paths.platformApp, "tns-java-classes.js"));
    
    // Remove blob files from prepared folder
    shelljs.rm("-rf", paths.platformSnapshotBlobs);
    // Remove prepared jniLibs and configurations (where include.gradle resides) folders from prepared folder
    shelljs.rm("-rf", paths.platformPluginSrc);
    shelljs.rm("-rf", paths.platformPluginConfigurations);
};

exports.cleanPluginBuildFolder = function(paths) {
    shelljs.rm("-rf", paths.pluginArtefactsRoot);
}

exports.paths = function(projectRoot) {
    var pluginName = "nativescript-dev-android-snapshot";
    var paths = {};
    // Project
    paths.root = projectRoot;
    paths.app = path.join(paths.root, "app");
    paths.projectTemplatePackageJson = path.join(paths.root, "package.json");
    paths.projectAppPackageJson = path.join(paths.app, "package.json");
    paths.nodeModules = path.join(paths.root, "node_modules");
    paths.nodeModulesTnsCoreModules = path.join(paths.nodeModules, "tns-core-modules");
    paths.nodeModuleAngular = path.join(paths.nodeModules, "@angular");
    paths.nodeModuleAngularCore = path.join(paths.nodeModuleAngular, "core");
    paths.nodeModuleNativeScriptAngular = path.join(paths.nodeModules, "nativescript-angular");

    // Platform
    paths.platformRoot = path.join(paths.root, "platforms/android");
    paths.platformAppRoot = path.join(paths.platformRoot, "src/main/assets");
    paths.platformApp = path.join(paths.platformAppRoot, "app");
    paths.platformNativeScriptRegularAar = path.join(paths.platformRoot, "libs/runtime-libs/nativescript-regular.aar");
    paths.platformSnapshotBlobs = path.join(paths.platformAppRoot, "snapshots");
    paths.platformPluginSrc = path.join(paths.platformRoot, "src", pluginName);
    paths.platformPluginJniLibs = path.join(paths.platformPluginSrc, "jniLibs");
    paths.platformPluginConfigurations = path.join(paths.platformRoot, "configurations", pluginName);
    paths.tnsModules = path.join(paths.platformApp, "tns_modules");
    paths.tnsModulesTnsCoreModules = path.join(paths.tnsModules, "tns-core-modules");
    paths.tnsModuleAngular = path.join(paths.tnsModules, "@angular");
    paths.tnsModuleAngularCore = path.join(paths.tnsModuleAngular, "core");
    paths.tnsModuleNativeScriptAngular = path.join(paths.tnsModules, "nativescript-angular");
    paths.tnsModuleShellJs = path.join(paths.tnsModules, "shelljs");

    // Plugin
    paths.pluginRoot = path.join(paths.nodeModules, pluginName);
    paths.pluginBundler = path.join(paths.pluginRoot, "bundler");
    paths.pluginMksnapshotRoot = path.join(paths.pluginRoot, "mksnapshot");
    paths.pluginIntermediates = path.join(paths.pluginRoot, "intermediates");
    paths.pluginIntermediatesCoreModules = path.join(paths.pluginIntermediates, "tns-core-modules.zip");
    paths.pluginMksnapshotShellScript = path.join(paths.pluginMksnapshotRoot, "mksnapshot.sh");
    paths.pluginIncludeGradleFile = path.join(paths.pluginMksnapshotRoot, "include.gradle");
    paths.pluginNdkBuildSeed = path.join(paths.pluginMksnapshotRoot, "ndk-build");
    paths.pluginMksnapshotCurrent = getMksnapshotToolsPath(paths.pluginMksnapshotRoot, paths.platformNativeScriptRegularAar);
    paths.pluginTnsJavaClasses = path.join(paths.pluginBundler, "tns-java-classes.js");

    paths.pluginArtefactsRoot = path.join(paths.pluginRoot, "build");
    paths.pluginArtefactsWebpack = path.join(paths.pluginArtefactsRoot, "webpack-bundle");
    paths.pluginArtefactsMksnapshot = path.join(paths.pluginArtefactsRoot, "snapshots");
    paths.pluginArtefactsMksnapshotBlobs = path.join(paths.pluginArtefactsMksnapshot, "blobs");
    paths.pluginArtefactsMksnapshotSources = path.join(paths.pluginArtefactsMksnapshot, "src");
    paths.pluginArtefactsNdkBuild = path.join(paths.pluginArtefactsRoot, "ndk-build");
    paths.pluginArtefactsNdkBuildLibs = path.join(paths.pluginArtefactsNdkBuild, "libs");

    return paths;
};

exports.isSnapshotEnabled = function(projectData, hookArgs) {
    if (hookArgs.platform !== "android") {
        return false;
    }

    if (process.env[environmentVariableToggleKey] === "0") {
        return false;
    }

    if (projectData.$options.bundle) {
        return false;
    }

    if (projectData.$options.release || process.env[environmentVariableToggleKey]) {
        return true;
    }

    return false;
};

// This is required to ensure that all npm operations are executed in the project directory.
exports.executeInDir = function(dir, action) {
    var currentDir = shelljs.pwd();
    shelljs.cd(dir);
    try {
        action();
    } finally {
        shelljs.cd(currentDir);
    }
}
