import execa from "execa";
import {loadHelmChart, resolveHelmChartDir, validateAndMergeConfig} from "./utils.js";
import {InputPluginConfig} from "./pluginConfig.js";
import {PublishContext} from "semantic-release";

export async function publish(pluginConfig: InputPluginConfig, context: PublishContext): Promise<void> {
    const {chartDirectory, ociRegistry, chartRepository} = validateAndMergeConfig(pluginConfig);
    const chartDir = resolveHelmChartDir(chartDirectory, context.cwd);

    const chart = await loadHelmChart(chartDir);
    if (ociRegistry) {
        await publishChartToOCIRegistry(chartDirectory, ociRegistry, chart.name, chart.version);
        context.logger.log("Chart %s:%s successfully published to %s.", chart.name, chart.version, ociRegistry);
    }
    if (chartRepository) {
        await publishChartToChartRepository(chartDirectory);
        context.logger.log("Chart %s:%s successfully published to %s.", chart.name, chart.version, chartRepository);
    }
}

async function publishChartToOCIRegistry(chartDirectory: string, registry: string, name: string, version: string): Promise<void> {
    const registryUrl = `oci://${registry}`;
    const inferredFileName = `${name}-${version}.tgz`;
    await execa("helm", ["package", chartDirectory]);
    await execa("helm", ["push", inferredFileName, registryUrl]);
}

async function publishChartToChartRepository(chartDirectory: string) {
    await execa("helm", ["cm-push", chartDirectory, "semantic-release-helm"]);
}
