import * as vscode from 'vscode';

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
): Promise<T | undefined> {
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

/**
 * 将字符串转换为驼峰命名法
 *
 * @param str 待转换的字符串
 * @returns 转换后的驼峰命名法字符串
 */
export function toCamelCase(str: string): string {
  // 用正则表达式将空格后的字母大写
  const camelCaseStr = str.replace(/\s(.)/g, (match, group1) => {
    return group1.toUpperCase();
  })
  // 移除所有空格
  .replace(/\s/g, '')
  // 将第一个单词的首字母转换为小写
  .replace(/^(.)/, (match, group1) => {
    return group1.toLowerCase();
  });

  return camelCaseStr;
}