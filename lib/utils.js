function validateAndMergeConfig(pluginConfig) {
    const config = {
        chartDirectory: ".",
        useOCIFeature: true,
        versionUpdatePolicy: "sync",
        appVersionUpdatePolicy: "sync",
        ...pluginConfig
    }

    if (!config.repository) {
        throw new Error('Missing config: `registry`');
    }

    return config;
}

module.exports = {
    validateAndMergeConfig
}