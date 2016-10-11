// The global mock provided by webpack is not working for all modules
var global = Function('return this')();
global.global = global;

// V8 5.3 fails to snapshot Maps with function keys
delete global.Map;
global.Map = require("./libs/es6-map-shim").Map;
delete global.WeakMap;
global.WeakMap = require("./libs/weakmap");
