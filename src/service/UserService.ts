import { LocalStorageService } from './LocalStorageService';

export class UserService {
  constructor(private localStorageService: LocalStorageService) {}

  public isVipUser(): boolean {
      const userInfo = this.localStorageService.get<{ username: string; password: string }>('userInfo');
      return userInfo !== undefined && userInfo.username !== '' && userInfo.password !== '';
  }
}
