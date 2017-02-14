var webpack = require("webpack");
var path = require("path");
var rootPath = process.argv[3];
var warmupFile = process.argv[5];
var destDir = process.argv[7];

module.exports = {
    context: rootPath,
    entry: {
        app: [
            path.join(__dirname, "bundle-preamble.js"),
            path.join(__dirname, warmupFile),
            path.join(destDir, "require-override-warmup.js"),
        ]
    },
    output: {
        path: destDir,
        pathinfo: true,
        filename: "bundle.js"
    },
    resolve: {
        root: [
            rootPath,
            path.join(rootPath, "tns-core-modules")
        ],
        extensions: ["", ".js"],
        packageMains: ["main"],
        modulesDirectories: [
            "tns_modules",
            "node_modules"
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
    recordsPath: path.join(destDir, "bundle.records.json")
};
