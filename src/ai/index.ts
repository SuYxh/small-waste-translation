import { extractDataFromString, extractPenultimateJson, getSelectedText, replaceSelectedText, showErrorMessage, showInformationMessage, showTranslationChoices, withProgress } from "@/utils";
import { OpenaiService } from './openai';

const openaiService = new OpenaiService()


function getAIProviderInstance() {
  return openaiService
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

    // 将 ArrayBuffer 转换为 Buffer
    const buffer = Buffer.from(arrayBuffer);
    // 解析接口返回的数据
    const result: any = extractPenultimateJson(buffer.toString())

    if (result.text) {
      // 解析GPT返回的 markdown 数据
      const formatData: any = extractDataFromString(result.text)

      // 展示翻译结果
      let selected = await showTranslationChoices(formatData.data ?? []);
      if (!selected) return;
      // 替换选中的文本
      await replaceSelectedText(selected);
    } else {
      console.log('askToAI-解析-error', result);
      showErrorMessage(result);
      // 清理 AccessToken
      aiInstacne.cleanAccessToken();
    }
  } catch (error) {
    console.log('askToAI-error', error);
  }
}