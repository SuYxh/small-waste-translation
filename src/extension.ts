import * as vscode from 'vscode';
import { registerCommand } from './utils/index';
import { translateToChinese, translateToEnglish } from './core/index';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "small-waste-translation" is now active!');

	registerCommand(context, 'small-waste-translation.translateToChinese', translateToChinese)
	registerCommand(context, 'small-waste-translation.translateToEnglish', translateToEnglish)

}

export function deactivate() {}
