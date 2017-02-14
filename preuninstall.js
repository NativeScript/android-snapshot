var hook = require('nativescript-hook')(__dirname);
var common = require('./hooks/common');

common.cleanPlatformsFolder(common.paths(hook.findProjectDir()));
hook.preuninstall();
