import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { WebviewMessageHandler } from './WebviewMessageHandler';

export class WebviewManager {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public openWebview() {
    const panel = vscode.window.createWebviewPanel(
      'settingWebview',
      '小废物设置面板',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    new WebviewMessageHandler(panel, this.context); // 这里初始化消息处理器
    this.loadWebviewContent(panel);
  }

  private loadWebviewContent(panel: vscode.WebviewPanel) {
    const distPath = path.join(this.context.extensionPath, 'src', 'webview-app', 'dist');
    const distUri = panel.webview.asWebviewUri(vscode.Uri.file(distPath));

    const indexHtmlPath = path.join(distPath, 'index.html');
    let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

    // 使用 distUri 替换资源文件路径
    indexHtmlContent = indexHtmlContent.replace(/(src|href)="([^"]*)"/g, (match, p1, p2) => {
      // 注意这里使用了 distUri 和相对路径 p2 来构建新的 URI
      let relativePath = p2.startsWith('/') ? p2.substring(1) : p2; // 移除路径开头的斜杠（如果存在）
      return `${p1}="${distUri}/${relativePath}"`;
    });

    panel.webview.html = indexHtmlContent;
  }

}
