// The global mock provided by webpack is not working for all modules
var global = Function('return this')();
global.global = global;
