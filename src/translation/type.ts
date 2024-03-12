export interface ITranslateTextResult {
  // 翻译后的文本
  translation: string,
  // 源文本
  originText: string,
  // 源语言
  sourceLang: string, 
  // 目标语言
  targetLang: string,
  // 翻译平台
  platform: string
}

export interface ITranslationService {
  getPlatform(): string;
  translateText(text: string, targetLang: string, sourceLang?: string): Promise<ITranslateTextResult[]>;
}