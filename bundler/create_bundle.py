#!/usr/bin/env python

import sys
import os
import json
import shutil
from subprocess import call

angular_bundle = False

def create_map_line(key, value):
    return '        "{0}": function() {{ return require("{1}") }},\n'.format(key, value);

def generate_require_statement(basePath, relativeRootPath, file, stripTnsCoreModulesKeyName = False):
    path_map = []
    if not stripTnsCoreModulesKeyName and (relativeRootPath.startswith("tns-core-modules/") or relativeRootPath == "tns-core-modules"):
        path_map = generate_require_statement(basePath, relativeRootPath, file, True)
    relativePath = os.path.join(relativeRootPath, file).replace("\\", '/');
    absolutePath = basePath + relativePath;
    def key(k):
        if stripTnsCoreModulesKeyName:
            if k.startswith("tns-core-modules/"):
                return k[len("tns-core-modules/"):]
            elif k == "tns-core-modules":
                return ""
        return k

    if file.endswith("/index.js"):
        path_map.append(create_map_line(key(relativePath[:-len("/index.js")]), relativePath))
        path_map.append(create_map_line(key(relativePath[:-len("index.js")]), relativePath))

    if file.endswith(".js"):
        path_map.append(create_map_line(key(relativePath[:-len(".js")]), relativePath))
        path_map.append(create_map_line(key(relativePath), relativePath))
    elif file == "package.json":
        with open(absolutePath) as data_file:
            data = json.load(data_file)

        if "main" in data:
            path_map.append(create_map_line(key(relativeRootPath), relativeRootPath))
            path_map.append(create_map_line(key(relativeRootPath + "/"), relativeRootPath))

    return path_map

def add_angular_dependencies(path_map):
    rootPath = sys.argv[1]
    path_map.append('        "@angular/common": function() { return require("@angular/common") },\n');
    path_map.append('        "@angular/common/": function() { return require("@angular/common") },\n');
    path_map.append('        "@angular/compiler": function() { return require("@angular/compiler") },\n');
    path_map.append('        "@angular/compiler/": function() { return require("@angular/compiler") },\n');
    path_map.append('        "@angular/core": function() { return require("@angular/core") },\n');
    path_map.append('        "@angular/core/": function() { return require("@angular/core") },\n');
    path_map.append('        "@angular/forms": function() { return require("@angular/forms") },\n');
    path_map.append('        "@angular/forms/": function() { return require("@angular/forms") },\n');
    path_map.append('        "@angular/http": function() { return require("@angular/http") },\n');
    path_map.append('        "@angular/http/": function() { return require("@angular/http") },\n');
    path_map.append('        "@angular/platform-browser": function() { return require("@angular/platform-browser") },\n');
    path_map.append('        "@angular/platform-browser/": function() { return require("@angular/platform-browser") },\n');
    path_map.append('        "@angular/platform-browser-dynamic": function() { return require("@angular/platform-browser-dynamic") },\n');
    path_map.append('        "@angular/platform-browser-dynamic/": function() { return require("@angular/platform-browser-dynamic") },\n');
    path_map.append('        "@angular/router": function() { return require("@angular/router") },\n');
    path_map.append('        "@angular/router/": function() { return require("@angular/router") },\n');

def generate_require_override():
    path_map = []
    rootPath = sys.argv[1]
    exclude = set([
        "@angular/common",
        "@angular/compiler",
        "@angular/core",
        "@angular/forms",
        "@angular/http",
        "@angular/platform-browser",
        "@angular/platform-browser-dynamic",
        "@angular/router",
        "nativescript-angular/node_modules/@angular",
        "parse5",
        "rxjs/bundles",
        "rxjs/testing",
        "querystring/test",
        "reflect-metadata/test",
        "reflect-metadata/temp",
        "symbol-observable/es",
    ])

    if angular_bundle:
        add_angular_dependencies(path_map);

    for root, dirs, files in os.walk(rootPath, topdown=True):
        dirs[:] = [d for d in dirs]
        for file in files:
            relativeRootPath = root[len(rootPath):]
            isExcluded = False
            for excludedDir in exclude:
                if relativeRootPath.startswith(excludedDir):
                    isExcluded = True
                    break
            if not isExcluded:
                path_map.extend(generate_require_statement(rootPath, relativeRootPath, file))


    path_map.sort();
    with open("require-override-template.js", "r+b") as require_template:
        return require_template.read().replace('/* __require-map__ */', ''.join(map(str, path_map)).rstrip(), 1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print "Location to precompiled tns_modules is missing"
        sys.exit(2)

    root_path = sys.argv[1]

    if not os.path.exists("build/bundler"):
        os.makedirs("build/bundler")

    if len(sys.argv) == 3 and sys.argv[2] == "--ng":
        print "Creating Angular bundle"
        angular_bundle = True

    require_override = generate_require_override()

    with open("build/bundler/require-override-warmup.js", "w+b") as require_warmup:
        require_warmup.write(require_override)

    warmup_file = "nativescript-angular-warmup.js" if angular_bundle else "nativescript-warmup.js"
    call(["node_modules/webpack/bin/webpack.js", "--root", root_path, "--warmup_file", warmup_file]);

    call(["./minify.sh", "build/bundler/bundle.js"]);

    print "Successfully created build/bundler/bundle.js"