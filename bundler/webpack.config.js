var webpack = require("webpack");
var path = require("path");
var rootPath = process.argv[3];

module.exports = {
    context: rootPath,
    entry: {
        app: [
            path.join(__dirname, "bundle-preamble.js"),
            path.join(__dirname, process.argv[5]),
            path.join(__dirname, "build/bundler/require-override-warmup.js"),
        ]
    },
    output: {
        path: path.join(__dirname, "build/bundler"),
        pathinfo: true,
        filename: "bundle.js"
    },
    resolve: {
        root: rootPath,
        extensions: ["", ".js"],
        packageMains: ["main"],
        modulesDirectories: [
            "tns_modules"
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "global.__snapshot": true
        })
    ],
    node: {
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
        setImmediate: false
    },
    recordsPath: path.join(__dirname, "build/bundler", "bundle.records.json")
};
