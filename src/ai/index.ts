import {
  extractDataFromString,
  extractPenultimateJson,
  getSelectedText,
  replaceSelectedText,
  showErrorMessage,
  showInformationMessage,
  showTranslationChoices,
  withProgress,
  getGitUserEmail,
  insertTextAboveSelection,
  getCursorPosition,
  insertTextAtPosition,
  getConfiguredModel,
  getLineContent,
  findTextAndGetLine,
} from "@/utils";

import { DeepseekService } from "./deepseek";
import { SiliconflowService } from "./siliconflow";
import DoubaoService from "./doubao";

const doubaoService = new DoubaoService();

function getJsDocService(model: string) {
  const modelMap = {
    "Doubao-pro-32k": new DoubaoService("Doubao-pro-32k"),
    "deepseek-v3": new DeepseekService(),
    "volcengine-deepseek-v3": new DoubaoService("volcengine-deepseek-v3"),
    "siliconflow-deepseek-v3": new SiliconflowService(),
  };

  // @ts-ignore
  return modelMap[model] ?? new DeepseekService();
}

function getAIProviderInstance() {
  return doubaoService;
}

export async function askToAI() {
  // 获取选中的文本
  const text = getSelectedText();
  if (!text) {
    showInformationMessage("当前没有选中文案");
    return;
  }

  try {
    const aiInstacne = getAIProviderInstance();
    const arrayBuffer = await withProgress<any>(
      "思考中...",
      // @ts-ignore
      async (progress, token) => {
        const arrayBuffer = await aiInstacne.genFuncName(text);
        return arrayBuffer;
      }
    );

    let keywords = arrayBuffer.choices[0]?.message?.content?.split(",") ?? [];

    if (keywords?.length) {
      keywords = keywords?.map((k: any) => k.trim());
      // 展示翻译结果
      let selected = await showTranslationChoices(keywords ?? []);
      if (!selected) return;
      // 替换选中的文本
      await replaceSelectedText(selected);
    } else {
      console.log("askToAI-解析-error", arrayBuffer);
      showErrorMessage("生成失败");
      // 清理 AccessToken
      aiInstacne.cleanAccessToken();
    }
  } catch (error) {
    console.log("askToAI-error", error);
  }
}

export async function askToDeepseek() {
  // 获取选中的文本
  const text = getSelectedText();
  if (!text) {
    showInformationMessage("当前没有选中文案");
    return;
  }

  // 获取到第一行的文本
  const lines = text.split(/\r?\n/);
  const firstTextLine = lines[0];
  console.log("firstTextLine", firstTextLine);

  // 获取到选中时光标的位置
  const cursorPosition = getCursorPosition();
  console.log("cursorPosition", cursorPosition);

  // text 的第一行 --
  // const firstTextLine  = getLineContent(cursorPosition?.line - 1)

  // setTimeout(() => {
  //   const newLine = findTextAndGetLine(firstTextLine)
  //   console.log('newLine', newLine)
  //   insertTextAtPosition(newLine, cursorPosition?.column, 'respText')
  // }, 4000);
  // return

  // 获取 git 信息
  const gitUserEmail = await getGitUserEmail();
  console.log("askToDeepseek- Git用户名:", gitUserEmail);

  const model = getConfiguredModel();
  console.log("model", model);

  const jsDocService = getJsDocService(model);
  console.log("jsDocService", jsDocService);
  // return

  const content = `
    请根据以下函数生成 JSDoc 注释，严格按照以下格式返回, 如果函数没有参数，就不要 @param ，只要注释就好，以字符串格式返回， 不要使用 \`\`\` 引号进行包裹：
    /**
     * @author: ${gitUserEmail}
     * @description: 描述
     * @param {*} 参数名 - 描述
     * @returns {*} 描述
     */

    函数内容：
    ${text}
  `;

  try {
    // const result = await withProgress<any>(
    //   "思考中...",
    //   // @ts-ignore
    //   async (progress, token) => {
    //     const result = await deepseekService.chat([
    //       { role: "user", content },
    //     ]);
    //     return result;
    //   }
    // );

    const msg = [{ role: "user", content }];
    const doubaoMsg = {
      messages: msg,
      stream: false,
    };

    const prompt = jsDocService.platform === "doubao" ? doubaoMsg : msg;

    const result = await withProgress<any>(
      `思考中..., 使用的模型： ${model}`,
      // @ts-ignore
      async (progress, token) => {
        const result = await jsDocService.chat(prompt);
        return result;
      }
    );

    const respText = result.choices[0].message.content;
    console.log("askToDeepseek-result", respText);
    if (respText) {
      // 找到最新的行号
      let newLine = findTextAndGetLine(firstTextLine);
      console.log("newLine", newLine, typeof newLine);
      // newLine === 0 说明是在第一行，需要重新更新 newLine
      if (newLine === 0) {
        newLine = 1;
      }
      if (newLine) {
        // 在指定位置插入
        await insertTextAtPosition(newLine, 1, respText);
      } else {
        // 兜底：在选中的上方插入
        await insertTextAboveSelection(respText);
      }
    } else {
      console.log("askToDeepseek-解析-error", result);
      showErrorMessage(result);
    }
  } catch (error) {
    console.log("askToDeepseek-error", error);
  }
}
