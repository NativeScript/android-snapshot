var webpack = require("webpack");
var path = require("path");
var rootPath = process.argv[5];

module.exports = {
    context: rootPath,
    entry: {
        app: path.join(__dirname, "/angular_bundle_scripts.js")
    },
    output: {
        path: path.join(__dirname, "dist"),
        pathinfo: true,
        libraryTarget: "commonjs2",
        filename: "angular_bundle.js"
    },
    resolve: {
        root: rootPath,
        extensions: ["", ".js"],
        packageMains: ["main"],
        modulesDirectories: [
            "tns_modules",
        ]
    },
    node: {
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
        setImmediate: false
    },
    recordsPath: path.join(__dirname, "dist", "webpack.records.json")
};
