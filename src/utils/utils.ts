import type { ITranslationService, ITranslateTextResult } from '@/translation';

/**
 * 将字符串转换为驼峰命名法
 *
 * @param str 待转换的字符串
 * @returns 转换后的驼峰命名法字符串
 */
export function toCamelCase(str: string): string {
  // 用正则表达式将空格后的字母大写
  const camelCaseStr = str.replace(/\s(.)/g, (match, group1) => {
    return group1.toUpperCase();
  })
    // 移除所有空格
    .replace(/\s/g, '')
    // 将第一个单词的首字母转换为小写
    .replace(/^(.)/, (match, group1) => {
      return group1.toLowerCase();
    });

  return camelCaseStr;
}

/**
 * 生成错误消息
 *
 * @param msg 错误消息内容
 * @returns 返回带有前缀的错误消息
 */
export function genErrorMsg(msg: string) {
  const prefix = '小废物翻译提示';
  return `${prefix}-${msg}`;
}


/**
 * 获取所有平台的名称
 *
 * @param platforms 翻译服务数组
 * @returns 所有平台的名称组成的字符串数组
 */
export function gelAllPlatform(platforms: ITranslationService[]): string[] {
  return platforms.map(item => item.getPlatform())
}


/**
 * 在字符串后添加平台标识
 *
 * @param str 需要添加标识的字符串
 * @param platform 平台名称
 * @returns 返回添加平台标识后的字符串
 */
export function addPlatformFlag(str: string, platform: string) {
  // 添加平台标识，格式为 " --by-{platform}"
  return `${str} --by-${platform}`;
}


/**
 * 删除字符串中的平台标识
 *
 * @param str 待处理的字符串
 * @param platforms 平台标识数组
 * @returns 处理后的字符串
 */
export function delPlatformFlag(str: string, platforms: string[]) {
  // 构建正则表达式，用于匹配 " --by-{platform}"
  const regex = new RegExp(` --by-(${platforms.join('|')})`, 'g');
  // 使用正则表达式移除平台标识
  return str.replace(regex, '');
}


/**
 * 将翻译结果转换为ITranslateTextResult[]类型数组
 *
 * @param texts 翻译结果文本数组
 * @param originText 原始文本
 * @param sourceLang 源语言
 * @param targetLang 目标语言
 * @returns ITranslateTextResult[]类型数组
 */
export function convertTranslationResults(texts: string[], originText: string, sourceLang: string, targetLang: string, platform: string): ITranslateTextResult[] {
  return texts.map(item => {
    return {
      translation: item,
      originText,
      sourceLang,
      targetLang,
      platform,
    }
  });
}

/**
 * @description: 获取操作标识
 * @param {ITranslateTextResult} currentSelect 当前选中的翻译
 * @param {string} selectText 去掉平台标识后的选中文本
 * @return {*}
 */
export function getOperationIdentifier(currentSelect: ITranslateTextResult, selectText: string) {
  // 获取操作标识：是插入到选中文本下方还是替换选中文本
  const insertionThreshold = process.env.INSERTION_THRESHOLD || 10;
  // 翻译的文本内容的长度
  let counter = 0
  // 如果翻译的目标语言是英文
  if (currentSelect.targetLang.toLocaleLowerCase() === 'en') {
    counter = selectText.split(' ').length
  } else {
    // 中文
    counter = selectText.length
  }
  // 获取操作标识：是插入到选中文本下方还是替换选中文本
  return counter > +insertionThreshold ? 'insert' : 'replace';
}


export function extractPenultimateJson(str: string): object | null {
  // 按行分割字符串
  const lines = str.trim().split('\n');

  // 过滤出所有有效的JSON对象行
  const jsonLines = lines.filter(line => line.startsWith('{') && line.endsWith('}'));


  // 确保有足够的JSON对象行
  if (jsonLines.length < 2) {
    console.error('没有足够的JSON对象行');
    return null;
  }

  // 获取倒数第二个JSON对象行
  const penultimateJsonLine = jsonLines[jsonLines.length - 2];

  try {
    // 尝试将该行解析为JSON对象
    return JSON.parse(penultimateJsonLine);
  } catch (error) {
    console.error('JSON解析错误:', error);
    return null;
  }
}

export function extractDataFromString(str: string): object | null {
  // 正则表达式匹配{}内的内容
  const match = str.match(/\{.*?\}/gs);
  if (match && match[0]) {
      try {
          // 将匹配到的字符串转换为对象
          const data = JSON.parse(match[0]);
          return data;
      } catch (error) {
          console.error("解析JSON时出错:", error);
      }
  }
  return null;
}