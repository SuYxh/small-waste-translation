import * as vscode from 'vscode';
import { registerCommands } from './command';
import { init } from './init';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "small-waste-translation" is now active!');
	
	init(context)

	registerCommands(context)
}

export function deactivate() {}
