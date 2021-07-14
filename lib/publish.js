const fs = require('fs').promises;
const path = require('path');
const execa = require('execa');
const yaml = require('js-yaml');
const { validateAndMergeConfig } = require('./utils');

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
    const { ociRegistry, chartRepository, chartDirectory } = validateAndMergeConfig(pluginConfig);

    const chartPath = path.join(chartDirectory, 'Chart.yaml');
    const chartYaml = await fs.readFile(chartPath);
    const chart = yaml.load(chartYaml);
    if(ociRegistry){
        await publishChartToOCIRegistry(chartDirectory, ociRegistry, chart.name, chart.version);
        context.logger.log('Chart %s:%s successfully published to %s.', chart.name, chart.version, ociRegistry);
    }
    if(chartRepository){
        await publishChartToChartRepository(chartDirectory, chart.name);
        context.logger.log('Chart %s:%s successfully published to %s.', chart.name, chart.version, chartRepository);
    }
}