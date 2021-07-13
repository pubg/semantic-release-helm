const execa = require('execa');
const { validateAndMergeConfig } = require('./utils');

async function installHelmPushPlugin() {
    try {
        return await execa('helm', ['plugin', 'install', 'https://github.com/chartmuseum/helm-push.git']);
    } catch (error) {
        if (/Error: plugin already exists/.test(error.stderr)) { // Catch plugin already exists error
            return error
        }
        throw error;
    }
}

async function loginChartRepository(repository, username, password) {
    try {
        // Input password through commandline to avoid `Error: inappropriate ioctl for device`
        // The password will masked like `--password='[secure]'` on console log
        return await execa('helm', ['repo', 'add', 'semantic-release-helm', `--username`, username, `--password`, password, repository])
    } catch (error) {
        if (/Error: repository name \(semantic-release-helm\) already exists/.test(error.stderr)) { // Catch repository already exists error
            return error
        }
        throw error;
    }

}

async function loginOCIRegistry(repository, username, password) {
    return await execa('helm', ['registry', 'login', '--username', username, '--password-stdin', repository], {
        input: password,
        env: {
            HELM_EXPERIMENTAL_OCI: 1
        }
    })
}

async function verifyChartRepository(repository, username, password) {
    await installHelmPushPlugin();
    await loginChartRepository(repository, username, password);
}

async function verifyOCIRegistry(repository, username, password) {
    await loginOCIRegistry(repository, username, password);
}

module.exports = async function (pluginConfig, context) {
    const { repository, useOCIFeature } = validateAndMergeConfig(pluginConfig);
    const { HELM_REPOSITORY_USERNAME, HELM_REPOSITORY_PASSWORD } = context.env;

    await verifyOCIRegistry(repository, HELM_REPOSITORY_USERNAME, HELM_REPOSITORY_PASSWORD)
    await verifyChartRepository(repository, HELM_REPOSITORY_USERNAME, HELM_REPOSITORY_PASSWORD)
}