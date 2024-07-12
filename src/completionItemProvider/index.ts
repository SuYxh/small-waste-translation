import * as vscode from "vscode";
import CompletionProvider from './CompletionItemProvider';

export function registerCompletionItemProvider(context: vscode.ExtensionContext) {
  let disposable = vscode.languages.registerCompletionItemProvider([
    {
      language: 'vue',
      scheme: 'file',
    },
    {
      language: 'html',
      scheme: 'file',
    },
    {
      language: 'javascript',
      scheme: 'file',
    },
    {
      language: 'typescript',
      scheme: 'file',
    },
    {
      language: 'javascriptreact',
      scheme: 'file',
    },
    {
      language: 'typescriptreact',
      scheme: 'file',
    },
  ],
    // 限制补全只在 TypeScript 文件中生效
    new CompletionProvider(),
    "-" // 触发补全的字符，这里是在点号后触发
  );

  context.subscriptions.push(disposable);
}