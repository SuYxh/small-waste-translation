import * as vscode from 'vscode';

export function showInputBox(prompt: string, placeHolder: string) {
  return new Promise<string>(async (resolve, reject) => {
    const usernameInput = await vscode.window.showInputBox({
      prompt,
      placeHolder
    });
    resolve(usernameInput ?? '')
  })
}

/**
 * 显示翻译结果并让用户选择
 * @param translations 翻译结果数组
 * @returns 用户选择的翻译结果
 */
export async function showTranslationChoices(translations: string[], placeHolder?: string): Promise<string | undefined> {
  placeHolder = placeHolder || '选择您喜欢的翻译';
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
export function registerCommand(context: vscode.ExtensionContext, commandName: string, callback: (...params: any) => any) {
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

/**
 * 在活动文本编辑器中替换指定范围内的文本。
 * 
 * 此函数尝试在Visual Studio Code当前活动的文本编辑器实例中替换指定范围内的文本。
 * 如果编辑器可用，它将执行文本替换，并提供操作成功或失败的反馈。
 * 如果没有活动的编辑器，它会显示错误信息。
 * 
 * @param range 要替换的文本范围，由编辑器的范围对象定义。
 * @param newText 替换旧文本的新文本。
 */
export function replaceTextInRange(range: any, newText: string) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    editor.edit(editBuilder => {
      editBuilder.replace(range, newText);
    }).then(success => {
      if (success) {
        // vscode.window.showInformationMessage('Text replaced successfully!');
      } else {
        vscode.window.showErrorMessage('Failed to replace text.');
      }
    });
  } else {
    vscode.window.showErrorMessage('No active editor.');
  }
}

/**
 * 获取当前光标所在的行和列
 * @returns {line: number, column: number} 返回一个对象，包含行和列的信息
 */
export function getCursorPosition(): { line: number; column: number } | undefined {
  // 获取当前活动的文本编辑器
  const editor = vscode.window.activeTextEditor;

  if (editor) {
      // 获取当前光标的位置
      const position = editor.selection.active;

      // 返回行和列的信息
      return {
          line: position.line + 1, // VS Code 中的行号从 0 开始，所以加 1
          column: position.character + 1 // VS Code 中的列号从 0 开始，所以加 1
      };
  }

  // 如果没有活动的文本编辑器，返回 undefined
  return undefined;
}

export function getConfiguredModel(): string {
  // 读取配置项
  const config = vscode.workspace.getConfiguration('jsDoc');
  // 默认值为 'deepseek-v3
  const model = config.get<string>('model', 'volcengine-deepseek-v3'); 

  return model;
}

// 定义获取指定行内容的方法
export function getLineContent(lineNumber: number): string | null {
  // 获取当前活动的文本编辑器
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
      return null;
  }

  // 获取文档
  const document = editor.document;

  // 检查行号是否有效
  if (lineNumber < 0 || lineNumber >= document.lineCount) {
      return null;
  }

  // 获取指定行的内容
  const line = document.lineAt(lineNumber);
  return line.text;
}


// 查找指定文本并获取其所在最新行号的方法
export function findTextAndGetLine(text: string): number | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
      return null;
  }
  const document = editor.document;
  const lineCount = document.lineCount;

  for (let i = 0; i < lineCount; i++) {
      const line = document.lineAt(i);
      if (line.text.includes(text)) {
          return i;
      }
  }
  return null;
}

