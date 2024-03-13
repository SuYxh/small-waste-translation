
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function openWebview(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'settingWebview', // Identifies the type of the webview. Used internally
    '小废物设置面板', // Title of the panel displayed to the user
    vscode.ViewColumn.One, // Editor column to show the new webview panel in.
    {
      enableScripts: true, //  开启 js
      retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
    } 
  );

  // 获取 webview 目录下dist文件夹的路径
  // @ts-ignore
  const distPathOnDisk = vscode.Uri.joinPath(context.extensionUri, '/src/webview-app/dist');
  console.log('distPathOnDisk', distPathOnDisk);

  // 获取dist文件夹的URI
  // @ts-ignore
  const distUri = panel.webview.asWebviewUri(distPathOnDisk);
  console.log('distUri', distUri);

  // 读取dist文件夹中index.html的内容
  const indexHtmlPath = path.join(distPathOnDisk.fsPath, 'index.html');
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

  // 将资源路径替换为webview的
  let updatedHtmlContent = indexHtmlContent
    .replace(/src="([^"]*)"/g, (match: any, p1: any) => {
      return `src="${distUri}/${p1}"`;
    })
    .replace(/href="([^"]*)"/g, (match: any, p1: any) => {
      return `href="${distUri}/${p1}"`;
    })

  // 设置 html 内容
  panel.webview.html = updatedHtmlContent;
}