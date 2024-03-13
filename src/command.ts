import * as vscode from 'vscode';
import { translateToChinese, translateToEnglish, generateFunctionName, resetCallTime, getRestCallTime, login, loginout } from '@/core';
import { registerCommand } from '@/utils';

export function registerCommands(context: vscode.ExtensionContext) {
	// 功能命令
  registerCommand(context, 'small-waste-translation.translateToChinese', translateToChinese)
	registerCommand(context, 'small-waste-translation.translateToEnglish', translateToEnglish)
	registerCommand(context, 'small-waste-translation.generateFunctionName', generateFunctionName)

	// 辅助命令
	registerCommand(context, 'small-waste-translation.resetCallTime', resetCallTime)
	registerCommand(context, 'small-waste-translation.getRestCallTime', getRestCallTime)
	registerCommand(context, 'small-waste-translation.login', login)
	registerCommand(context, 'small-waste-translation.login', loginout)
}