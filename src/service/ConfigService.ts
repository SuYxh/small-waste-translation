import * as vscode from 'vscode';
import { PLUGIN_NAME } from '@/const';

export class ConfigService {
    public static getDeeplKey(): string {
        return vscode.workspace.getConfiguration(PLUGIN_NAME).get<string>('deeplKey', '');
    }

    public static getBaiduAppId(): string {
        return vscode.workspace.getConfiguration(PLUGIN_NAME).get<string>('baiduAppId', '');
    }

    public static getBaiduAppKey(): string {
        return vscode.workspace.getConfiguration(PLUGIN_NAME).get<string>('baiduAppKey', '');
    }

    public static getTencentSecertId(): string {
        return vscode.workspace.getConfiguration(PLUGIN_NAME).get<string>('tencentSecertId', '');
    }

    public static getTencentSecertKey(): string {
        return vscode.workspace.getConfiguration(PLUGIN_NAME).get<string>('tencentSecertKey', '');
    }

    public static onDidChangeConfiguration(listener: (_: vscode.ConfigurationChangeEvent) => any) {
        vscode.workspace.onDidChangeConfiguration(listener);
    }
}
