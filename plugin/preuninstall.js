var path = require('path');
var shelljs = require('shelljs');
var hook = require('nativescript-hook')(__dirname);

var projectDir = hook.findProjectDir();
var platformAppDirectory = path.join(projectDir, "platforms/android/src/main/assets/app");

if (!shelljs.test("-e", path.join(platformAppDirectory, "tns_modules/application"))) {
    shelljs.touch("-c", path.join(projectDir, "node_modules/nativescript-angular/package.json"));
    shelljs.touch("-c", path.join(projectDir, "node_modules/tns-core-modules/package.json"));
}

shelljs.rm("-rf", path.join(projectDir, "node_modules", "tns-core-modules-snapshot"));
shelljs.rm("-rf", path.join(projectDir, "node_modules", "nativescript-angular-snapshot"));

shelljs.rm("-rf", path.join(platformAppDirectory, "app/tns-java-classes.js"));
shelljs.rm("-rf", path.join(platformAppDirectory, "app/_embedded_script_.js"));
shelljs.rm("-rf", path.join(platformAppDirectory, "../snapshots"));

hook.preuninstall();
