function validateAndMergeConfig(pluginConfig) {
    const config = {
        chartDirectory: ".",
        versionUpdatePolicy: "sync",
        appVersionUpdatePolicy: "sync",
        ...pluginConfig
    }

    if (!config.chartRepository) {
        throw new Error('Missing config: `Chart Repository`');
    }

    if (!config.OCIRegistry) {
        throw new Error('Missing config: `OCI Registry`');
    }

    return config;
}

module.exports = {
    validateAndMergeConfig
}