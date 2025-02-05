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
  insertTextAboveSelection
} from "@/utils";

import { DeepseekService } from "./deepseek";
import DoubaoService from './doubao'

const doubaoService = new DoubaoService()
const deepseekService = new DeepseekService();

function getAIProviderInstance() {
  return doubaoService;
}

export async function askToAI() {
  // 获取选中的文本
  const text = getSelectedText();
  if (!text) {
    showInformationMessage('当前没有选中文案')
    return;
  }

  try {
    const aiInstacne = getAIProviderInstance()
    const arrayBuffer = await withProgress<any>(
      '思考中...',
      // @ts-ignore
      async (progress, token) => {
        const arrayBuffer = await aiInstacne.genFuncName(text)
        return arrayBuffer
      }
    )

    let keywords = arrayBuffer.choices[0]?.message?.content?.split(",") ?? [];

    if (keywords?.length) {
      keywords = keywords?.map((k: any) => k.trim());
      // 展示翻译结果
      let selected = await showTranslationChoices(keywords ?? []);
      if (!selected) return;
      // 替换选中的文本
      await replaceSelectedText(selected);
    } else {
      console.log('askToAI-解析-error', arrayBuffer);
      showErrorMessage('生成失败');
      // 清理 AccessToken
      aiInstacne.cleanAccessToken();
    }
  } catch (error) {
    console.log('askToAI-error', error);
  }
}

export async function askToDeepseek() {
  const gitUserEmail = await getGitUserEmail();
  console.log("askToDeepseek- Git用户名:", gitUserEmail);

  // 获取选中的文本
  const text = getSelectedText();
  if (!text) {
    showInformationMessage("当前没有选中文案");
    return;
  }

  const content = `
    请根据以下函数生成 JSDoc 注释，严格按照以下格式返回，只要注释就好，以字符串格式返回， 不要使用 \`\`\` 引号进行包裹：
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
    const result = await withProgress<any>(
      "思考中...",
      // @ts-ignore
      async (progress, token) => {
        const result = await deepseekService.chat([
          { role: "user", content },
        ]);
        return result;
      }
    );

    const respText = result.choices[0].message.content;
    console.log("askToDeepseek-result", respText);
    if (respText) {
      await insertTextAboveSelection(respText);
    } else {
      console.log("askToDeepseek-解析-error", result);
      showErrorMessage(result);
    }
  } catch (error) {
    console.log("askToDeepseek-error", error);
  }
}