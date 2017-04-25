var cleanPlatformFolder = require("../snapshot-webpack-plugin").cleanPlatformFolder;

module.exports = function(logger, platformsData, projectData, hookArgs) {
    // Clean all snapshot artefacts from the platform folder
    if (hookArgs.platform.toLowerCase() === "android")
        cleanPlatformFolder(projectData.projectDir);
};