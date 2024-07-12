import * as vscode from "vscode";
import DoubaoService from "@/ai/doubao";
import { withProgress } from "@/utils/vscode";

class CompletionProvider implements vscode.CompletionItemProvider {
  doubao: DoubaoService;
  constructor() {
    this.doubao = new DoubaoService();
  }

  generatePrompt(options: any) {
    const { text } = options;
    const prompt = `
      - Role: 编程语言专家
      - Background: 用户需要将中文文案转换成小驼峰形式的函数名称，以便于在编程中使用。
      - Profile: 你是一位精通多种编程语言的专家，了解不同编程语言的命名规范。
      - Skills: 了解小驼峰命名法，能够将中文文案翻译成英文，并转换为小驼峰形式。
      - Goals: 设计一个函数，能够接受中文文案作为输入，输出小驼峰形式的函数名称。
      - Constrains: 转换过程需要保持原文案的语义，同时符合小驼峰命名法的规范。
      - OutputFormat: 输出应为小驼峰形式的字符串。
      - Workflow:
        1. 接收中文文案作为输入。
        2. 将中文文案翻译成英文。
        3. 转换英文为小驼峰形式。
        4. 输出结果。
    `;
    const data = {
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: `请你将我这个文案 ${text} 转成函数名称, 小驼峰形式，出我 5 个参考的变量名称，只返回变量名称，用英文逗号分割，不要解释！`,
        },
      ],
      stream: false,
    };
    return data;
  }

  async provideFunctionName(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    console.log("position", position.character, position.line);

    // 获取需要翻译的文案
    const startChar = "//";
    const line = document.lineAt(position).text;
    const sliceIndex = line.lastIndexOf(startChar, position.character);
    const textBeforeCursor = line
      .substring(sliceIndex + startChar.length, position.character - 2)
      .trim();
    console.log("sliceIndex", sliceIndex);
    console.log("textBeforeCursor", textBeforeCursor);
    if (!textBeforeCursor) {
      return [];
    }
    const range = new vscode.Range(
      position.line,
      sliceIndex + 3,
      position.line,
      position.character
    );

    // 生成 prompt
    const prompt = this.generatePrompt({ text: textBeforeCursor });

    // 调用 豆包大模型
    const result = await withProgress("🚀🚀🚀 正在拼命为您思考中！！!", () =>
      this.doubao.chat(prompt)
    );
    console.log("result", result);
    let keywords = result.choices[0]?.message?.content?.split(",") ?? [];
    if (keywords?.length) {
      keywords = keywords?.map((k: any) => k.trim());
    }
    // 生成 CompletionItem
    const list = keywords.map((keyword: string) => {
      const completionItem = new vscode.CompletionItem(
        keyword,
        vscode.CompletionItemKind.Keyword
      );
      // 设置补全项的详细描述
      completionItem.detail = `内容来自- ${this.doubao.platform} 大模型!`;
      // 设置补全项的文档
      completionItem.documentation = new vscode.MarkdownString(
        "👏👏👏欢迎使用小废物插件"
      );
      // 一定要设置为 ''
      completionItem.insertText = "";

      completionItem.command = {
        title: "替换选中的函数名",
        command: "small-waste-translation.chineseToFunctionName",
        arguments: [keyword, range],
      };

      return completionItem;
    });

    return list;
  }

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    // 获取当前位置的前一个字符
    const line = document.lineAt(position).text;
    const lastChar = line.charAt(line.length - 1);
    const secondToLastChar = line.charAt(line.length - 2);

    if (line.startsWith("//") && lastChar === "-" && secondToLastChar === "-") {
      return this.provideFunctionName(document, position);
    }
  }
}

export default CompletionProvider;
