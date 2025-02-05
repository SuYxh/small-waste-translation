import * as vscode from 'vscode';
import { translateToChinese, translateToEnglish, generateFunctionName, chineseToFunctionName, login, loginout, setting, generateJsDoc } from '@/core';
import { registerCommand } from '@/utils';

export function registerCommands(context: vscode.ExtensionContext) {
	// 功能命令
  registerCommand(context, 'small-waste-translation.translateToChinese', translateToChinese)
	registerCommand(context, 'small-waste-translation.translateToEnglish', translateToEnglish)
	registerCommand(context, 'small-waste-translation.generateFunctionName', generateFunctionName)
	registerCommand(context, 'small-waste-translation.chineseToFunctionName', chineseToFunctionName)
	registerCommand(context, 'small-waste-translation.generateJsDoc', generateJsDoc)

	// 辅助命令
	registerCommand(context, 'small-waste-translation.login', login)
	registerCommand(context, 'small-waste-translation.loginout', loginout)
	registerCommand(context, 'small-waste-translation.setting', () => {
		setting(context)
	})

	// 中文转函数名
}