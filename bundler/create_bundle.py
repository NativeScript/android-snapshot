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
    with open('dist/angular.records.json') as data_file:
        data = json.load(data_file)

    angular_included_scripts = data["modules"]["byIdentifier"]
    for angular_script_path in angular_included_scripts:
        if "angular_bundle_scripts" not in angular_script_path and "webpack" not in angular_script_path:
            path_map.extend(generate_require_statement(sys.argv[1], "", angular_script_path))

def generate_require_override():
    prefix = "global.__requireOverride = (function() {\n\
    var map = {\n"

    suffix = "    };\n\
    return function(moduleId) {\n\
        moduleId = moduleId.replace(/^\.\/tns_modules\//, '');\n\
        var module;\n\
        var moduleEntry = map[moduleId];\n\
        if (moduleEntry) {\n\
            module = moduleEntry();\n\
            if (module && module.evalLazy) {\n\
                module.evalLazy();\n\
                delete module.evalLazy;\n\
            }\n\
        }\n\
        return module;\n\
    }\n\
}());";

    path_map = ['       "./_embedded_script_.js": function() { return {}; },\n']
    rootPath = sys.argv[1]
    exclude = set([
        "@angular/common", "@angular/compiler", "@angular/core", "@angular/http", "@angular/platform-browser", "@angular/platform-browser-dynamic", "@angular/platform-server", "@angular/router-deprecated",
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
    return prefix + ' '.join(map(str, path_map)) + suffix

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print "Location to precompiled tns_modules is missing"
        sys.exit(2)

    root_path = sys.argv[1]

    if not os.path.exists("dist"):
        os.makedirs("dist")

    if len(sys.argv) == 3 and sys.argv[2] == "--ng":
        print "Creating Angular bundle"
        angular_bundle = True

    if angular_bundle:
        call(["webpack", "--config", "angular.webpack.config.js", "--root", root_path]);

    require_override = generate_require_override()

    with open("dist/require-override-warmup.js", "w+b") as require_warmup:
        require_warmup.write(require_override)

    warmup_file = "nativescript-angular-warmup.js" if angular_bundle else "nativescript-warmup.js"
    call(["webpack", "--config", "bundle.webpack.config.js",  "--root", root_path, "--warmup_file", warmup_file]);

    with open("dist/bundle.js", "r+b") as original_bundle:
        bundle_data = original_bundle.read()

    with open("dist/bundle.js", "w+b") as modified_bundle:
        with open("static_content.js") as static_content:
            modified_bundle.write(static_content.read() + bundle_data)

    call(["./minify.sh", "dist/bundle.js"]);

    print "Successfully created dist/bundle.js"