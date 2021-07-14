function validateAndMergeConfig(pluginConfig) {
    const config = {
        chartDirectory: ".",
        versionUpdatePolicy: "sync",
        appVersionUpdatePolicy: "sync",
        ...pluginConfig
    }
    if(!config.ociRegistry && !config.chartRepository) {
        throw new Error('Missing Config: `ociRegistry` or `chartRepository`')
    }
    return config;
}

module.exports = {
    validateAndMergeConfig
}