import execa from "execa";
import {validateAndMergeConfig} from "./utils.js";
import {InputPluginConfig, isExecaSyncError} from "./pluginConfig.js";
import {VerifyConditionsContext} from "semantic-release";

export async function verifyConditions(pluginConfig: InputPluginConfig, context: VerifyConditionsContext): Promise<void> {
    const {ociRegistry, chartRepository} = validateAndMergeConfig(pluginConfig);
    if (ociRegistry) {
        const {username, password} = resolveOCIRegistryCredentials(context);
        await verifyOCIRegistry(ociRegistry, username, password);
    }
    if (chartRepository) {
        const {username, password} = resolveChartRepositoryCredentials(context);
        await verifyChartRepository(chartRepository, username, password);
    }
    if (!ociRegistry && !chartRepository) {
        throw new Error("Either `ociRegistry` or `chartRepository` must be set.");
    }
}

async function installHelmPushPlugin() {
    try {
        return await execa("helm", ["plugin", "install", "https://github.com/chartmuseum/helm-push.git"]);
    } catch (error) {
        if (isExecaSyncError(error)) {
            // Catch plugin already exists error
            if (/Error: plugin already exists/.test(error.stderr)) {
                return;
            }
        }
        throw error;
    }
}

async function loginChartRepository(repository: string, username: string, password: string) {
    try {
        // Input password through commandline to avoid `Error: inappropriate ioctl for device`
        // The password will masked like `--password='[secure]'` on console log
        return await execa("helm", ["repo", "add", "semantic-release-helm", `--username`, username, `--password`, password, repository]);
    } catch (error) {
        if (isExecaSyncError(error)) {
            // Catch repository already exists error
            if (/Error: repository name \(semantic-release-helm\) already exists/.test(error.stderr)) {
                return;
            }
        }
        throw error;
    }
}

async function loginOCIRegistry(repository: string, username: string, password: string) {
    return execa("helm", ["registry", "login", "--username", username, "--password", password, repository]);
}

async function verifyChartRepository(repository: string, username: string, password: string) {
    await installHelmPushPlugin();
    await loginChartRepository(repository, username, password);
}

async function verifyOCIRegistry(repository: string, username: string, password: string) {
    await loginOCIRegistry(repository, username, password);
}

interface BasicAuth {
    username: string;
    password: string;
}

function resolveOCIRegistryCredentials(context: VerifyConditionsContext): BasicAuth {
    const {HELM_REGISTRY_USERNAME, HELM_REGISTRY_PASSWORD} = context.env;
    if (HELM_REGISTRY_USERNAME && HELM_REGISTRY_PASSWORD) {
        return {
            username: HELM_REGISTRY_USERNAME,
            password: HELM_REGISTRY_PASSWORD,
        };
    }

    context.logger.log("Environment variables HELM_REGISTRY_USERNAME and HELM_REGISTRY_PASSWORD are not set. fallback to use HELM_REPOSITORY_USERNAME and HELM_REPOSITORY_PASSWORD.");

    // fallback to resolve repository credentials
    return resolveChartRepositoryCredentials(context);
}

function resolveChartRepositoryCredentials(context: VerifyConditionsContext): BasicAuth {
    const {HELM_REPOSITORY_USERNAME, HELM_REPOSITORY_PASSWORD} = context.env;
    if (!HELM_REPOSITORY_USERNAME || !HELM_REPOSITORY_PASSWORD) {
        throw new Error("Environment variables HELM_REPOSITORY_USERNAME and HELM_REPOSITORY_PASSWORD are required.");
    }
    return {
        username: HELM_REPOSITORY_USERNAME,
        password: HELM_REPOSITORY_PASSWORD,
    };
}
