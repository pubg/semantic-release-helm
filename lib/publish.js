const fs = require('fs').promises;
const execa = require('execa');

async function publishChartToOCIRegistry(chartDirectory, registry, name, version) {
    const imageName = `${registry}/${name}:${version}`;
    await execa('helm', ['chart', 'save', chartDirectory, imageName], {
        env: {
            HELM_EXPERIMENTAL_OCI: 1
        }
    });
    await execa('helm', ['chart', 'push', imageName], {
        env: {
            HELM_EXPERIMENTAL_OCI: 1
        }
    });
}

async function publishChartToChartRepository(chartDirectory, name) {
    await execa('helm', ['push', chartDirectory, 'semantic-release-helm']);
}

module.exports = async (pluginConfig, context) => {
    const { repository, chartDirectory, useOCIFeature } = validateAndMergeConfig(pluginConfig);

    const chartPath = path.join(pluginConfig.path, 'Chart.yaml');
    const chartPath = path.join(chartDirectory, 'Chart.yaml');
    const chartYaml = await fs.readFile(chartPath);
    const chart = yaml.load(chartYaml);

    if (useOCIFeature) {
        await publishChartToOCIRegistry(chartDirectory, repository, chart.name, chart.version);
    } else {
        await publishChartToChartRepository(chartDirectory, chart.name);
    }
    context.logger.log('Chart %s:%s successfully published to %s.', chart.name, chart.version, repository);
}