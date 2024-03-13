import * as vscode from 'vscode';
import { PLUGIN_NAME } from '@/const';

export class ConfigService {
    public static getUsername(): string {
        return vscode.workspace.getConfiguration(PLUGIN_NAME).get<string>('username', '');
    }

    public static getPassword(): string {
        return vscode.workspace.getConfiguration(PLUGIN_NAME).get<string>('password', '');
    }

    public static onDidChangeConfiguration(listener: (_: vscode.ConfigurationChangeEvent) => any) {
        vscode.workspace.onDidChangeConfiguration(listener);
    }
}
