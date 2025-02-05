import { getSelectedText, replaceSelectedText, showErrorMessage, showInformationMessage, showTranslationChoices, withProgress } from "@/utils";
import DoubaoService from './doubao'

const doubaoService = new DoubaoService()

function getAIProviderInstance() {
  return doubaoService
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