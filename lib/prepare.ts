import {inc} from 'semver';
import {PrepareContext, ReleaseType} from "semantic-release";
import {HelmChart, PluginConfig, VersionUpdatePolicy} from "./pluginConfig.js";
import {loadHelmChart, resolveHelmChartDir, validateAndMergeConfig, writeHelmChart} from "./utils.js";

export async function prepare(pluginConfig: PluginConfig, context: PrepareContext): Promise<void> {
    const {chartDirectory, versionUpdatePolicy, appVersionUpdatePolicy} = validateAndMergeConfig(pluginConfig);
    const chartDir = resolveHelmChartDir(chartDirectory, context.cwd);

    const oldChart = await loadHelmChart(chartDir);

    const nextVersion = getNextVersion(versionUpdatePolicy, oldChart.version, context.nextRelease.version, context.nextRelease.type);
    if (!nextVersion) {
        throw new Error("Next Chart Version is undefined after applying version update policy.");
    }
    const nextAppVersion = getNextVersion(appVersionUpdatePolicy, oldChart.appVersion, context.nextRelease.version, context.nextRelease.type);

    const newChart: HelmChart = {
        ...oldChart,
        version: nextVersion,
        appVersion: nextAppVersion || undefined,
    };

    await writeHelmChart(chartDir, newChart);
    context.logger.log(
        `Chart.yaml versions are updated, version: (%s -> %s) appVersion: (%s -> %s).`,
        oldChart.version,
        nextVersion,
        oldChart.appVersion,
        nextAppVersion
    );
}

function getNextVersion(policy: VersionUpdatePolicy, prevVersion: string | undefined, nextVersion: string, releaseType: ReleaseType) {
    switch (policy) {
        case "fixed":
            return prevVersion;
        case "sync":
            return nextVersion;
        case "desync":
            if (!prevVersion) {
                return null;
            }
            return inc(prevVersion, releaseType);
        default:
            throw new Error(`Unknown policy: ${policy}`);
    }
}
