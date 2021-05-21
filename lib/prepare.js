const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const semver = require('semver');
const { validateAndMergeConfig } = require('./utils');
const { fstat } = require('fs');

function getNextVersion(policy, prevVersion, nextVersion, releaseType) {
    switch (policy) {
        case "fixed":
            return prevVersion;
        case "sync":
            return nextVersion;
        case "desync":
            return semver.inc(prevVersion, releaseType);
        default:
            throw new Error(`Unknown policy: ${policy}`)
    }
}

module.exports = async (pluginConfig, context) => {
    const { chartDirectory, versionUpdatePolicy, appVersionUpdatePolicy } = validateAndMergeConfig(pluginConfig);

    const chartPath = path.join(chartDirectory, 'Chart.yaml');
    const oldChartYaml = await fs.readFile(chartPath);
    const oldChart = yaml.load(oldChartYaml);

    const nextVersion = getNextVersion(versionUpdatePolicy, oldChart.version, context.nextRelease.version, context.nextRelease.type);
    const nextAppVersion = getNextVersion(appVersionUpdatePolicy, oldChart.appVersion, context.nextRelease.version, context.nextRelease.type);

    const newChart = yaml.dump({
        ...oldChart,
        version: nextVersion,
        appVersion: nextAppVersion,
    })
    await fs.writeFile(chartPath, newChart);
    context.logger.log(`Chart.yaml versions are updated, version: (%s -> %s) appVersion: (%s -> %s).`, oldChart.version, nextVersion, oldChart.appVersion, nextAppVersion);
}