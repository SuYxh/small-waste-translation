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

  verifyApiKey(key: string, secret?: string): Promise<boolean>;
}

export interface IAIService {
  platform: string;

  getAccessToken(): Promise<any>;
  cleanAccessToken(): void;
  handleAccessToken(): void;
}


export interface IUseFeature {
  successCb: Function
  apiName: string 
  failCb?: Function
}