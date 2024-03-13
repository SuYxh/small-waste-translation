import { LocalStorageService } from './LocalStorageService';
import { showErrorMessage, showInformationMessage, showInputBox } from '@/utils';
import { openaiLogin } from '@/ai/openai';
import { USERNAME, PASSWORD, OPENAI_ACCESS_TOKEN, USER_VIDATE, IS_SYSTEM_USER } from '@/const';

export class UserService {
  constructor(private localStorageService: LocalStorageService) { }

  public isVipUser(): boolean {
    // 判断是否是系统用户，如果是就不是 vip 用户
    const isSystemUser = this.localStorageService.get<string>(IS_SYSTEM_USER);
    return !isSystemUser
  }

  public async login(): Promise<void> {
    try {
      const usernameInput = await showInputBox('请输入用户名', 'Username')
      console.log('usernameInput', usernameInput)

      const passwordInput = await showInputBox('请输入密码', 'Password')
      console.log('passwordInput', passwordInput)

      const result = await openaiLogin(usernameInput, passwordInput)
      if (result.data) {
        // 登录成功将 token 和用户信息保存到本地
        this.localStorageService.set(USERNAME, usernameInput, USER_VIDATE)
        this.localStorageService.set(PASSWORD, passwordInput, USER_VIDATE)
        this.localStorageService.set(OPENAI_ACCESS_TOKEN, result.data, USER_VIDATE)
        showInformationMessage('登录成功！')
      } else {
        console.log('login-接口-error', result)
        showErrorMessage(result.message ?? '用户名或密码错误')
      }
    } catch (error) {
      console.log('login-error', error)
      showErrorMessage('登录出错')
    }
  }

  public async logout(): Promise<void> {
    this.localStorageService.delete(USERNAME)
    this.localStorageService.delete(PASSWORD)
    this.localStorageService.delete(OPENAI_ACCESS_TOKEN)
    this.localStorageService.set(IS_SYSTEM_USER, true);
  }
}
