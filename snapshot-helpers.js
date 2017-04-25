exports.makeConfig = function(options) {
    options = options || {};

    // This will prevent accessing `module.export` on snapshot generation
    if (options.output && options.output.libraryTarget) {
        options.output.libraryTarget = undefined;
    }

    return options;
}