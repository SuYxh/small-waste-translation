import * as vscode from 'vscode';
import { translateToChinese, translateToEnglish, generateFunctionName } from '@/core';
import { registerCommand } from '@/utils';

export function registerCommands(context: vscode.ExtensionContext) {
  registerCommand(context, 'small-waste-translation.translateToChinese', translateToChinese)
	registerCommand(context, 'small-waste-translation.translateToEnglish', translateToEnglish)
	registerCommand(context, 'small-waste-translation.generateFunctionName', generateFunctionName)
}