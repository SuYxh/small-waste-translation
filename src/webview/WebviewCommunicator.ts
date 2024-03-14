// 在你的扩展代码中
import * as vscode from 'vscode';

export class WebviewCommunicator {
  private panel: vscode.WebviewPanel;

  constructor(panel: vscode.WebviewPanel) {
    this.panel = panel;
  }

  sendMessage(message: any) {
    this.panel.webview.postMessage(message);
  }
}
