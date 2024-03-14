import * as vscode from 'vscode';
import { LOCAL_STORAGE_SERVICE, USER_SERVICE, USAGE_LIMIT_SERVICE, IS_SYSTEM_USER } from '@/const';
import { DIContainer, LocalStorageService, UserService, UsageLimitService } from '@/service';

export async function init(context: vscode.ExtensionContext) {
  // 注册 LOCAL_STORAGE_SERVICE
  const localStorageService = new LocalStorageService(context.globalState);
  DIContainer.instance.register(LOCAL_STORAGE_SERVICE, localStorageService);

  const userService = new UserService(localStorageService);
  DIContainer.instance.register(USER_SERVICE, userService);


  const usageLimitService = new UsageLimitService(localStorageService, userService);
  DIContainer.instance.register(USAGE_LIMIT_SERVICE, usageLimitService);

  // 初始化限制并开始计划每日重置
  usageLimitService.checkAndInitializeDailyLimits();
  usageLimitService.scheduleDailyReset();

  // localStorageService.set(IS_SYSTEM_USER, true);
}