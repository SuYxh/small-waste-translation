import type { ITranslationService, ITranslateTextResult } from "@/type";
import {
  LOCAL_STORAGE_SERVICE,
  USER_SERVICE,
  TRANSLATE_CALL_TIMES,
  TRANSLATE,
  GENERATE_FUNCTION_NAME,
  GENERATE_FUNCTION_NAME_CALL_TIMES,
  IS_SYSTEM_USER,
} from "@/const";
import { IUseFeature } from "@/type";
import {
  DIContainer,
  LocalStorageService,
  UserService,
  UsageLimitService,
} from "@/service";
import { showErrorMessage } from "./vscode";
import * as vscode from "vscode";
import { execSync } from 'child_process';


/**
 * 将字符串转换为驼峰命名法
 *
 * @param str 待转换的字符串
 * @returns 转换后的驼峰命名法字符串
 */
export function toCamelCase(str: string): string {
  // 用正则表达式将空格后的字母大写
  const camelCaseStr = str
    .replace(/\s(.)/g, (match, group1) => {
      return group1.toUpperCase();
    })
    // 移除所有空格
    .replace(/\s/g, "")
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
  const prefix = "小废物翻译提示";
  return `${prefix}-${msg}`;
}

/**
 * 获取所有平台的名称
 *
 * @param platforms 翻译服务数组
 * @returns 所有平台的名称组成的字符串数组
 */
export function gelAllPlatform(platforms: ITranslationService[]): string[] {
  return platforms.map((item) => item.getPlatform());
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
  const regex = new RegExp(` --by-(${platforms.join("|")})`, "g");
  // 使用正则表达式移除平台标识
  return str.replace(regex, "");
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
export function convertTranslationResults(
  texts: string[],
  originText: string,
  sourceLang: string,
  targetLang: string,
  platform: string
): ITranslateTextResult[] {
  return texts.map((item) => {
    return {
      translation: item,
      originText,
      sourceLang,
      targetLang,
      platform,
    };
  });
}

/**
 * @description: 获取操作标识是：插入到选中文本下方还是替换选中文本， 主要看翻译的文本内容长度
 * @param {ITranslateTextResult} currentSelect 当前选中的翻译
 * @param {string} selectText 去掉平台标识后的选中文本
 * @return {*}
 */
export function getOperationIdentifier(
  currentSelect: ITranslateTextResult,
  selectText: string
) {
  // 获取操作标识：是插入到选中文本下方还是替换选中文本
  const insertionThreshold = process.env.INSERTION_THRESHOLD || 10;
  // 翻译的文本内容的长度
  let counter = 0;
  // 如果翻译的目标语言是英文
  if (currentSelect.targetLang.toLocaleLowerCase() === "en") {
    counter = selectText.split(" ").length;
  } else {
    // 中文
    counter = selectText.length;
  }
  // 获取操作标识：是插入到选中文本下方还是替换选中文本
  return counter > +insertionThreshold ? "insert" : "replace";
}

export function extractPenultimateJson(str: string): object | string {
  // 按行分割字符串
  const lines = str.trim().split("\n");

  // 过滤出所有有效的JSON对象行
  const jsonLines = lines.filter(
    (line) => line.startsWith("{") && line.endsWith("}")
  );

  // 确保有足够的JSON对象行
  if (jsonLines.length < 2) {
    try {
      const data = JSON.parse(jsonLines[0]);
      console.error("没有足够的JSON对象行-1");
      return data.message ?? "";
    } catch (error) {
      console.error("没有足够的JSON对象行-2");
      return "没有足够的JSON对象行";
    }
  }

  // 获取倒数第二个JSON对象行
  const penultimateJsonLine = jsonLines[jsonLines.length - 2];

  try {
    // 尝试将该行解析为JSON对象
    return JSON.parse(penultimateJsonLine);
  } catch (error) {
    console.error("JSON解析错误:", error);
    return "没有足够的JSON对象行";
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

export function getAPIDefaultCallTimes(apiName: string) {
  const config: any = {
    [TRANSLATE]: TRANSLATE_CALL_TIMES,
    [GENERATE_FUNCTION_NAME]: GENERATE_FUNCTION_NAME_CALL_TIMES,
  };

  return config[apiName] ?? -1;
}

export function useFeatureTranslate(options: IUseFeature) {
  const { successCb, apiName, failCb } = options;

  const localStorageService = DIContainer.instance.get<LocalStorageService>(
    LOCAL_STORAGE_SERVICE
  );
  const userService = DIContainer.instance.get<UserService>(USER_SERVICE);

  const usageLimitService = new UsageLimitService(
    localStorageService,
    userService
  );

  if (usageLimitService.canUseFeature(apiName)) {
    usageLimitService.recordFeatureUse(apiName);
    if (typeof successCb === "function") {
      successCb();
    }
  } else {
    if (typeof failCb === "function") {
      failCb();
    } else {
      showErrorMessage("普通用户每天使用该功能的次数已达到上限!");
    }
  }
}

export function setSystemUser(flag: boolean) {
  const localStorageService = DIContainer.instance.get<LocalStorageService>(
    LOCAL_STORAGE_SERVICE
  );
  localStorageService.set(IS_SYSTEM_USER, flag);
}

export function setSystemDefaultValue() {
  const localStorageService = DIContainer.instance.get<LocalStorageService>(
    LOCAL_STORAGE_SERVICE
  );
  localStorageService.set(IS_SYSTEM_USER, true);
  localStorageService.set(TRANSLATE, 0);
  localStorageService.set(GENERATE_FUNCTION_NAME, 0);
}


/**
 * 获取Git用户名
 * @returns 返回Git用户名，如果获取失败则返回空字符串
 */
export function getGitUserEmail(): string {
  try {
    // 先尝试获取本地配置
    try {
      const localName = execSync('git config user.email', { encoding: 'utf-8' }).trim();
      if (localName) {
        console.log('获取到本地Git用户名:', localName);
        return localName;
      }
    } catch (error) {
      console.log('获取本地Git用户名失败，尝试获取全局配置');
    }

    // 如果本地配置不存在，尝试获取全局配置
    const globalName = execSync('git config --global user.email', { encoding: 'utf-8' }).trim();
    console.log('获取到全局Git用户名:', globalName);
    return globalName;

  } catch (error) {
    console.error('获取Git用户名失败:', error);
    return '';
  }
}

/**
 * 在选中文本的上方插入内容
 * @param insertText 要插入的文本
 * @param editor 当前编辑器实例
 * @returns Promise<boolean>
 */
export async function insertTextAboveSelection(insertText: string): Promise<boolean> {
  try {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return false;
    }

    const selection = editor.selection;
    const startLine = selection.start.line;
    
    // 创建一个在选中文本上方的位置
    const position = new vscode.Position(startLine, 0);
    
    // 插入文本并在末尾添加换行符
    await editor.edit(editBuilder => {
      editBuilder.insert(position, insertText + '\n');
    });
    
    return true;
  } catch (error) {
    console.error('插入文本失败:', error);
    return false;
  }
}

/**
 * 在指定位置插入数据
 * @param line 行号（从 1 开始）
 * @param column 列号（从 1 开始）
 * @param text 要插入的文本
 * @returns 是否插入成功
 */
export async function insertTextAtPosition(line: number, column: number, text: string): Promise<boolean> {
  // 获取当前活动的文本编辑器
  const editor = vscode.window.activeTextEditor;

  if (editor) {
      // 将行号和列号转换为 VS Code 的 Position 对象（注意：VS Code 的行和列是从 0 开始的）
      const position = new vscode.Position(line - 1, column - 1);

      // 使用 edit 方法插入文本
      const success = await editor.edit(editBuilder => {
          editBuilder.insert(position, text);
      });

      return success; // 返回是否插入成功
  }

  // 如果没有活动的文本编辑器，返回 false
  return false;
}