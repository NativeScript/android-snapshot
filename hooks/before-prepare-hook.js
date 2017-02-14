var common = require("./common");

module.exports = function(logger, platformsData, projectData, hookArgs) {
    if (hookArgs.platform.toLowerCase() !== "android")
        return;

    var paths = common.paths(projectData.projectDir);
    common.cleanPlatformsFolder(paths);
    common.cleanPluginBuildFolder(paths);
};