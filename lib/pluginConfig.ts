import typia from "typia";
import {ExecaSyncError} from "execa";

export interface HelmChart {
    name: string;
    version: string;
    appVersion: string | undefined;

    [key: string]: any;
}

export type VersionUpdatePolicy = "fixed" | "sync" | "desync";

export interface PluginConfig {
    chartDirectory: string;
    versionUpdatePolicy: VersionUpdatePolicy;
    appVersionUpdatePolicy: VersionUpdatePolicy;

    ociRegistry: string | undefined;
    chartRepository: string | undefined;
}

export interface InputPluginConfig extends Partial<PluginConfig> {
}

export const assertPluginConfig = typia.createAssert<PluginConfig>();

export const assertInputPluginConfig = typia.createAssert<InputPluginConfig>();

export const assertChart = typia.createAssert<HelmChart>();

export const isExecaSyncError = typia.createIs<ExecaSyncError>();
