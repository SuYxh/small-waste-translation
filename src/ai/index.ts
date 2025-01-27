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
import { OpenaiService } from "./openai";
import { DeepseekService } from "./deepseek";

const openaiService = new OpenaiService();
const deepseekService = new DeepseekService();

function getAIProviderInstance() {
  return openaiService;
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

    // 将 ArrayBuffer 转换为 Buffer
    const buffer = Buffer.from(arrayBuffer);
    // 解析接口返回的数据
    const result: any = extractPenultimateJson(buffer.toString());

    if (result.text) {
      // 解析GPT返回的 markdown 数据
      const formatData: any = extractDataFromString(result.text);

      // 展示翻译结果
      let selected = await showTranslationChoices(formatData.data ?? []);
      if (!selected) return;
      // 替换选中的文本
      await replaceSelectedText(selected);
    } else {
      console.log("askToAI-解析-error", result);
      showErrorMessage(result);
      // 清理 AccessToken
      aiInstacne.cleanAccessToken();
    }
  } catch (error) {
    console.log("askToAI-error", error);
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
     * @return {*} 描述
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
