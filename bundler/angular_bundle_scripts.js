var core = require('angular2/core');
var common = require('angular2/common');
var compiler = require('angular2/compiler');
var platform = {
    browser: require('angular2/platform/browser'),
    common_dom: require('angular2/platform/common_dom')
};
var http = require('angular2/http');
var router = require('angular2/router');
var router_link_dsl = require('angular2/router/router_link_dsl.js');
var instrumentation = require('angular2/instrumentation');
var upgrade = require('angular2/upgrade');