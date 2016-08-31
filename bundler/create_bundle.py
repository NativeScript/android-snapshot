#!/usr/bin/env python

import sys
import os
import json
import shutil
from subprocess import call

angular_bundle = False

def generate_require_statement(basePath, relativeRootPath, file):
    path_map = []
    relativePath = os.path.join(relativeRootPath, file).replace("\\", '/');
    absolutePath = basePath + "/" + relativePath;

    if file.endswith("/index.js"):
        path_map.append('       "' + relativePath[:-len("/index.js")] + '": function() { return require("' + relativePath + '") },\n');
        path_map.append('       "' + relativePath[:-len("index.js")] + '": function() { return require("' + relativePath + '") },\n');

    if file.endswith(".js"):
        path_map.append('       "' + relativePath[:-len(".js")] + '": function() { return require("' + relativePath + '") },\n');
        path_map.append('       "' + relativePath + '": function() { return require("' + relativePath + '") },\n');
    elif file == "package.json":
        with open(absolutePath) as data_file:
            data = json.load(data_file)

        if "main" in data:
            path_map.append('       "' + relativeRootPath + '": function() { return require("' + relativeRootPath + '") },\n')
            path_map.append('       "' + relativeRootPath + "/" + '": function() { return require("' + relativeRootPath + '") },\n')

    return path_map

def add_angular_dependencies(path_map):
    with open('build/bundler/angular.records.json') as data_file:
        data = json.load(data_file)

    angular_included_scripts = data["modules"]["byIdentifier"]
    for angular_script_path in angular_included_scripts:
        if "angular_bundle_scripts" not in angular_script_path and "webpack" not in angular_script_path:
            path_map.extend(generate_require_statement(sys.argv[1], "", angular_script_path))

def generate_require_override():
    path_map = []
    rootPath = sys.argv[1]
    exclude = set([
        "@angular/common", "@angular/compiler", "@angular/core", "@angular/http", "@angular/platform-browser", "@angular/platform-browser-dynamic", "@angular/platform-server", "@angular/router",
        "rxjs", "zone.js/lib", "reflect-metadata/test",  "reflect-metadata/temp", "querystring/test", "parse5", "es6-shim", "es6-promise"])

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
        return require_template.read().replace('/* __require-map__ */', ' '.join(map(str, path_map)).rstrip(), 1)

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

    if angular_bundle:
        call(["node_modules/webpack/bin/webpack.js", "--config", "angular.webpack.config.js", "--root", root_path]);

    require_override = generate_require_override()

    with open("build/bundler/require-override-warmup.js", "w+b") as require_warmup:
        require_warmup.write(require_override)

    warmup_file = "nativescript-angular-warmup.js" if angular_bundle else "nativescript-warmup.js"
    call(["node_modules/webpack/bin/webpack.js", "--config", "bundle.webpack.config.js",  "--root", root_path, "--warmup_file", warmup_file]);

    with open("build/bundler/bundle.js", "r+b") as original_bundle:
        bundle_data = original_bundle.read()

    with open("build/bundler/bundle.js", "w+b") as modified_bundle:
        with open("static_content.js") as static_content:
            modified_bundle.write(static_content.read() + bundle_data)

    call(["./minify.sh", "build/bundler/bundle.js"]);

    print "Successfully created build/bundler/bundle.js"