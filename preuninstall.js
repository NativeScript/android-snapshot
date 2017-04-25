var hook = require('nativescript-hook')(__dirname);
var cleanPlatformFolder = require("../snapshot-webpack-plugin").cleanPlatformFolder;

// Clean all snapshot artefacts from the platform folder
cleanPlatformFolder(hook.findProjectDir());
hook.preuninstall();
