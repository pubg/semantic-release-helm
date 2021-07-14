function validateAndMergeConfig(pluginConfig) {
    const config = {
        chartDirectory: ".",
        versionUpdatePolicy: "sync",
        appVersionUpdatePolicy: "sync",
        ...pluginConfig
    }

    return config;
}

module.exports = {
    validateAndMergeConfig
}