import * as vscode from 'vscode';
import { registerCommand } from '@/utils';
import { translateToChinese, translateToEnglish, generateFunctionName } from '@/core';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "small-waste-translation" is now active!');

	registerCommand(context, 'small-waste-translation.translateToChinese', translateToChinese)
	registerCommand(context, 'small-waste-translation.translateToEnglish', translateToEnglish)
	registerCommand(context, 'small-waste-translation.generateFunctionName', generateFunctionName)
}

export function deactivate() {}
