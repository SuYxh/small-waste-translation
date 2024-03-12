import * as vscode from 'vscode';

/**
 * 显示翻译结果并让用户选择
 * @param translations 翻译结果数组
 * @returns 用户选择的翻译结果
 */
export async function showTranslationChoices(translations: string[], placeHolder?: string): Promise<string | undefined> {
  placeHolder = placeHolder || 'Choose your preferred translation';
  const selected = await vscode.window.showQuickPick(translations, {
    placeHolder,
  });
  return selected;
}


/**
 * 显示错误消息
 *
 * @param message 错误消息内容
 */
export function showErrorMessage(message: string) {
  vscode.window.showErrorMessage(message);
}

/**
 * 显示信息消息
 *
 * @param message 要显示的消息的内容
 */
export function showInformationMessage(message: string) {
  vscode.window.showInformationMessage(message);
}

/**
 * 注册命令
 *
 * @param context vscode.ExtensionContext，扩展上下文
 * @param commandName 命令名称
 * @param callback 回调函数
 */
export function registerCommand(context: vscode.ExtensionContext, commandName: string, callback: () => any) {
  const disposable = vscode.commands.registerCommand(commandName, callback);
	context.subscriptions.push(disposable);
}


/**
 * 获取当前选中的文本
 * @returns 当前选中的文本字符串
 */
export const getSelectedText = (): string | undefined => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return undefined;

  const selection = editor.selection;
  return editor.document.getText(selection);
};

/**
* 替换当前选中的文本
* @param newText 要替换成的新文本
*/
export const replaceSelectedText = async (newText: string): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  await editor.edit((editBuilder) => {
      const selection = editor.selection;
      editBuilder.replace(selection, newText);
  });
};


/**
 * 获取注释前缀
 *
 * @param languageId 语言ID
 * @returns 包含前缀和后缀的对象，若无后缀则suffix为undefined
 */
export function getCommentPrefix(languageId: string): { prefix: string, suffix?: string } {
  switch (languageId) {
    case 'javascript':
    case 'typescript':
    case 'javascriptreact':
    case 'typescriptreact':
    case 'vue': // 假定Vue文件主要以JavaScript为主
      return { prefix: '// ' };
    case 'html':
    case 'markdown':
      return { prefix: '<!-- ', suffix: ' -->' };
    case 'css':
    case 'sass':
    case 'scss':
      return { prefix: '/* ', suffix: ' */' };
    default:
      return { prefix: '// ' }; // 默认注释方式
  }
}


/**
* 在当前选中的文本下一行插入文本, 以注释的形式插入
* @param newText 要插入的新文本
*/
export const insertTextBelowSelectionByComment = async (newText: string): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const languageId = editor.document.languageId;
  const { prefix, suffix } = getCommentPrefix(languageId);

  await editor.edit((editBuilder) => {
    const selection = editor.selection;
    const line = selection.end.line;
    const position = new vscode.Position(line + 1, 0);
    const commentText = suffix ? `${prefix}${newText}${suffix}\n` : `${prefix}${newText}\n`;
    editBuilder.insert(position, commentText);
  });
};



/**
* 在当前选中的文本下一行插入文本
* @param newText 要插入的新文本
*/
export const insertTextBelowSelection = async (newText: string): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  await editor.edit((editBuilder) => {
      const selection = editor.selection;
      const line = selection.end.line;
      const position = new vscode.Position(line + 1, 0);
      editBuilder.insert(position, newText + '\n');
  });
};

/**
 * 使用进度条执行异步操作，并支持取消。
 * @param title 进度条上显示的标题。
 * @param task 要执行的异步任务。
 */
export function withProgress<T>(
    title: string,
    task: (progress: vscode.Progress<{ increment?: number }>, token: vscode.CancellationToken) => Promise<T>
): Promise<T> {
    return new Promise((resolve, reject) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: title,
            cancellable: true,
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log("User canceled the long running operation");
                reject('Operation cancelled by the user');
            });

            try {
                const result = await task(progress, token);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    });
}