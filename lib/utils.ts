import {
    assertChart,
    assertInputPluginConfig,
    assertPluginConfig,
    HelmChart,
    InputPluginConfig,
    PluginConfig
} from "./pluginConfig.js";
import path from "node:path";
import fs from "node:fs/promises";
import yaml from "js-yaml";
import os from "node:os";

export function validateAndMergeConfig(pluginConfig: InputPluginConfig): PluginConfig {
    assertInputPluginConfig(pluginConfig);

    const defaultConfig: InputPluginConfig = {
        chartDirectory: ".",
        versionUpdatePolicy: "sync",
        appVersionUpdatePolicy: "sync",
    };
    const mergedConfig: InputPluginConfig = {
        ...defaultConfig,
        ...pluginConfig,
    };

    const config: PluginConfig = assertPluginConfig(mergedConfig);
    return config;
}

export function resolveHelmChartDir(chartDirectory: string, cwd: string | undefined): string {
    if (chartDirectory.startsWith("~/")) {
        return path.resolve(os.homedir(), chartDirectory.substring(2));
    } else {
        if (chartDirectory.startsWith("/")) {
            return path.resolve(chartDirectory);
        } else {
            return path.resolve(cwd || process.cwd(), chartDirectory);
        }
    }
}

export async function loadHelmChart(chartDir: string): Promise<HelmChart> {
    const chartMetadataPath = path.resolve(chartDir, "Chart.yaml");
    const chartYaml = await fs.readFile(chartMetadataPath, {encoding: "utf-8"});
    const rawChart = yaml.load(chartYaml) as HelmChart;
    return assertChart(rawChart);
}

export async function writeHelmChart(chartDir: string, chart: HelmChart): Promise<void> {
    const chartMetadataPath = path.resolve(chartDir, "Chart.yaml");
    const newChart = yaml.dump(chart, {indent: 2});
    await fs.writeFile(chartMetadataPath, newChart);
}
