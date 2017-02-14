var path = require("path");
var fs = require("fs");
var shelljs = require("shelljs");
var semver = require("semver");
var AdmZip = new require("adm-zip");
var common = require("./common");

var MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT = "2.5.0";

function getAndroidRuntimeVersion(paths) {
    if (!shelljs.test("-e", paths.platformRoot)) {
        return null;
    }

    try {
        var appPackageJSON = JSON.parse(fs.readFileSync(paths.projectTemplatePackageJson, "utf8"));
        var version = appPackageJSON["nativescript"]["tns-android"]["version"];
        return version.replace(/\-.*/, "");
    } catch(e) {
        return null;
    }
}

function validateAndroidRuntimeVersion(paths) {
    // Validate android runtime version
    var currentRuntimeVersion = getAndroidRuntimeVersion(paths);
    if (!currentRuntimeVersion) {
        throw new Error("In order to generate a V8 snapshot you must have the \"android\" platform installed - to do so please run \"tns platform add android\".");
    }

    // The version could be "next"
    if (semver.valid(currentRuntimeVersion)) {
        if (!semver.gte(currentRuntimeVersion, MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT)) {
            throw new Error("In order to support heap snapshots, you must have at least tns-android@" + MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT +
                " installed. Current Android Runtime version is: " + currentRuntimeVersion + ".");
        }
    }
}

function deleteNativeScriptCoreModules(paths) {
    var coreModulesFolders = shelljs.ls(paths.nodeModulesTnsCoreModules);
    for (var i = 0; i < coreModulesFolders.length; i++) {
        shelljs.rm("-rf", path.join(paths.tnsModulesTnsCoreModules, coreModulesFolders[i]));
    }
}

function deleteAngularModules(paths) {
    var angularDependencies = Object.keys(JSON.parse(fs.readFileSync(path.join(paths.nodeModuleNativeScriptAngular, "package.json"), "utf8"))["dependencies"]);
    for (var i = 0; i < angularDependencies.length; i++) {
        if (/^@angular\//.test(angularDependencies[i])) {
            shelljs.rm("-rf", path.join(paths.tnsModules, angularDependencies[i]));
            shelljs.rm("-rf", path.join(paths.tnsModuleNativeScriptAngular, "node_modules", angularDependencies[i]));
        }
    }
    shelljs.rm("-rf", paths.tnsModuleNativeScriptAngular);
}

function deleteBundledFiles(paths) {
    var bundleRecordsPath = path.join(paths.pluginArtefactsWebpack, "bundle.records.json");
    var modulesInSnapshot = Object.keys(JSON.parse(fs.readFileSync(bundleRecordsPath, "utf8"))["modules"]["byIdentifier"]);
    for (var i = 0; i < modulesInSnapshot.length; i++) {
        if (/^\.\.\//.test(modulesInSnapshot[i]) || modulesInSnapshot[i].indexOf("^") !== -1) {
            continue;
        }

        shelljs.rm("-f", path.join(paths.tnsModules, modulesInSnapshot[i]));
        shelljs.rm("-f", path.join(paths.tnsModules, modulesInSnapshot[i].replace(/\.js$/, ".ts")));
        shelljs.rm("-f", path.join(paths.tnsModules, modulesInSnapshot[i].replace(/\.js$/, ".d.ts")));
        shelljs.rm("-f", path.join(paths.tnsModules, modulesInSnapshot[i] + ".map"));
    }
}

function isAngularInstalled(paths) {
    return shelljs.test("-e", paths.nodeModuleNativeScriptAngular);
};

function deleteWebpackedModules(paths, logger) {
    deleteNativeScriptCoreModules(paths);
    logger.warn("The \"tns-core-modules\" package and its dependencies have been deleted from the final assets.");
    if (isAngularInstalled(paths)) {
        // has nativescript-angular installed
        deleteAngularModules(paths);
        logger.warn("The \"nativescript-angular\" package and its dependencies have been deleted from the final assets.");
    }
    deleteBundledFiles(paths);
    shelljs.rm("-rf", paths.tnsModuleShellJs); // delete shellJs
}

function addSnapshotKeyInPackageJSON(appPackageJSONPath) {
    var appPackageJSON = shelljs.test("-e", appPackageJSONPath) ? 
        JSON.parse(fs.readFileSync(appPackageJSONPath, 'utf8')) : 
        {};

    appPackageJSON["android"] = appPackageJSON["android"] || {};
    appPackageJSON["android"]["heapSnapshotBlob"] = "../snapshots";

    fs.writeFileSync(appPackageJSONPath, JSON.stringify(appPackageJSON, null, 2));
}

function generateWebpackBundle(paths, isAngularApp) {
    common.executeInDir(paths.pluginBundler, function() {
        if (shelljs.exec("python ./create_bundle.py " + paths.tnsModules + " " + paths.pluginArtefactsWebpack + (isAngularApp ? " --ng" : "")).code !== 0) {
            throw new Error("The bundle generation process exited with error.");
        }
        shelljs.cp(paths.pluginTnsJavaClasses, paths.pluginArtefactsWebpack);
        shelljs.mv(path.join(paths.pluginArtefactsWebpack, "bundle.min.js"), path.join(paths.pluginArtefactsWebpack, "_embedded_script_.js"));
    });
}

function generateSnapshots(paths) {
    if (!shelljs.test("-e", paths.pluginMksnapshotCurrent)) {
        throw new Error("Looking for mksnapshot tools at " + paths.pluginMksnapshotCurrent + " but can't find them there.");
    }

    // Make *.blob and *.c files with the mksnapshot tool
    common.executeInDir(paths.pluginMksnapshotCurrent, function(){
        shelljs.rm("-rf", paths.pluginArtefactsMksnapshot);
        shelljs.exec(paths.pluginMksnapshotShellScript + " " + path.join(paths.pluginArtefactsWebpack, "_embedded_script_.js") + " " + paths.pluginArtefactsMksnapshot);
    });
}

function buildSnapshotLibs(paths, androidNdkBuildPath) {
    // Compile *.c files to produce *.so libraries with ndk-build tool
    shelljs.cp("-r", paths.pluginNdkBuildSeed, paths.pluginArtefactsNdkBuild);
    shelljs.mv(paths.pluginArtefactsMksnapshotSources + "/*", path.join(paths.pluginArtefactsNdkBuild, "jni"));
    common.executeInDir(paths.pluginArtefactsNdkBuild, function(){
        shelljs.exec(androidNdkBuildPath);
    });
}

function copySnapshotLibsInPlatformsFolder(paths, builtLibsPath) {
    // Copy the libs to the specified destination in the platforms folder
    shelljs.mkdir("-p", paths.platformPluginSrc);
    shelljs.cp("-r", builtLibsPath, paths.platformPluginJniLibs + "/");
    // Copy include.gradle to the specified destination in the platforms folder
    shelljs.mkdir("-p", paths.platformPluginConfigurations);
    shelljs.cp(paths.pluginIncludeGradleFile, paths.platformPluginConfigurations);
}

function ensureTnsCoreModulesArePrepared(paths) {
    if (shelljs.test("-e", path.join(paths.tnsModulesTnsCoreModules, "application"))) {
        // save prepared tns-core-modules as a zip file
        var zip = new AdmZip();
        zip.addLocalFolder(paths.tnsModulesTnsCoreModules);
        zip.writeZip(path.join(paths.pluginIntermediatesCoreModules));
    }
    else if (shelljs.test("-e", paths.pluginIntermediatesCoreModules)) {
        // restore tns-core-modules from a previously saved zip file
        var zip = new AdmZip(paths.pluginIntermediatesCoreModules);
        zip.extractAllTo(paths.tnsModulesTnsCoreModules, true);
    }
}

module.exports = function(logger, platformsData, projectData, hookArgs) {
    if (hookArgs.platform.toLowerCase() !== "android")
        return;

    var paths = common.paths(projectData.projectDir);

    common.executeInDir(paths.root, function() {
        if (!common.isSnapshotEnabled(projectData, hookArgs)) {
            if (!projectData.$options.bundle) {
                // TODO: Fix this in the CLI if possible
                if (shelljs.test("-e", paths.nodeModuleAngularCore) && !shelljs.test("-e", paths.tnsModuleAngularCore)) {
                    shelljs.cp("-r", paths.nodeModuleAngular, path.tnsModules);
                }
            }
            return;
        }

        var isAngularApp = isAngularInstalled(paths);

        validateAndroidRuntimeVersion(paths);

        ensureTnsCoreModulesArePrepared(paths);
        generateWebpackBundle(paths, isAngularApp);
        deleteWebpackedModules(paths, logger);
        generateSnapshots(paths); // generates .blob and .c files

        // _embedded_script_.js is packed in the .apk because it is needed by the metadata generator
        shelljs.cp(path.join(paths.pluginArtefactsWebpack, "_embedded_script_.js"), paths.platformApp);
        shelljs.cp(path.join(paths.pluginArtefactsWebpack, "tns-java-classes.js"), paths.platformApp);

        var options = JSON.parse(fs.readFileSync(paths.projectAppPackageJson, "utf8")).snapshotOptions || {};
        if (options.useLibs) {
            var builtLibsPath = options.prebuildLibsPath || paths.pluginArtefactsNdkBuildLibs;
            if (!options.prebuildLibsPath) {
                var androidNdkBuildPath = options.androidNdkPath ? path.join(options.androidNdkPath, "ndk-build") : "ndk-build";
                buildSnapshotLibs(paths, androidNdkBuildPath);
            }
            copySnapshotLibsInPlatformsFolder(paths, builtLibsPath);
            logger.out("Snapshot will be included in the app as dynamically linked library (.so file).");
        }
        else {
            // Copy the blobs in the prepared app folder
            shelljs.rm("-rf", paths.platformSnapshotBlobs);
            shelljs.cp("-R", paths.pluginArtefactsMksnapshotBlobs, paths.platformSnapshotBlobs + "/");
            /* 
            Rename TNSSnapshot.blob files to snapshot.blob files. The xxd tool uses the file name for the name of the static array. This is why the *.blob files are initially named  TNSSnapshot.blob.
            After the xxd step, they must be renamed to snapshot.blob, because this is the filename that the Android runtime is looking for.
            */
            common.executeInDir(paths.platformSnapshotBlobs, function() { shelljs.exec("find . -name '*.blob' -execdir mv {} snapshot.blob ';'"); });
            // Update the package.json
            addSnapshotKeyInPackageJSON(path.join(paths.platformApp, "package.json"));
            logger.warn("Snapshot will be included in the app as binary .blob file. The more space-efficient option is to embed it in a dynamically linked library (.so file).");
        }
    });
};
