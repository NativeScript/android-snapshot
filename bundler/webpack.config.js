var webpack = require("webpack");
var path = require("path");
var rootPath = process.argv[3];

module.exports = {
    context: rootPath,
    entry: {
        app: path.join(__dirname, "dist/starter.js")
    },
    output: {
        path: path.join(__dirname, "dist"),
        pathinfo: true,
        libraryTarget: "commonjs2",
        filename: "ns_bundle.js"
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
            global: 'global',
            __dirname: '__dirname',
            "global.__snapshot": true
        })
    ]
};
