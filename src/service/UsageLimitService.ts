import { LocalStorageService } from './LocalStorageService';
import { UserService } from './UserService';
import { TRANSLATE, GENERATE_FUNCTION_NAME, DEEPL_KEY, BAIDU_APP_ID, TENCENT_SECRET_ID } from '@/const';
import { getAPIDefaultCallTimes } from '@/utils';

export class UsageLimitService {
    constructor(private localStorageService: LocalStorageService, private userService: UserService) { }

    // 检查并初始化每日限制
    public checkAndInitializeDailyLimits(): void {
        const lastInitialized = this.localStorageService.get<string>('lastInitialized');
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        if (lastInitialized !== today) {
            console.log('进行初始化，重制使用次数');
            this.initializeDailyLimits()
            this.localStorageService.set('lastInitialized', today);
        } else {
            console.log('今天已经进行过初始化');
        }
    }


    // 初始化调用次数
    public initializeDailyLimits(): void {
        this.setFeatureUsage(TRANSLATE, 0);
        this.setFeatureUsage(GENERATE_FUNCTION_NAME, 0);
    }

    // 设置特定功能的使用次数
    private setFeatureUsage(featureName: string, count: number): void {
        const key = this.getDailyKey(featureName);
        this.localStorageService.set(key, count);
    }

    // 每天特定时间（如6点）重置调用次数
    public resetDailyLimits(): void {
        this.initializeDailyLimits(); // 重置为初始状态
    }

    public scheduleDailyReset(): void {
        const now = new Date();
        let nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0); // 今天6点
        if (now >= nextReset) {
            // 如果当前时间已经超过今天的6点，则计划在明天6点重置
            nextReset.setDate(nextReset.getDate() + 1);
        }

        const delay = nextReset.getTime() - now.getTime(); // 下次重置的毫秒数
        setTimeout(() => {
            this.resetDailyLimits();
            this.scheduleDailyReset(); // 重置后再次安排下一次重置
        }, delay);
    }

    private getDailyKey(featureName: string): string {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return `${featureName}:${today}`;
    }

    public hasTranslateConfig(): boolean {
        // 判断一下本地是否有配置的翻译 API, 这里只判断了 id ，如果有id key 肯定也有
        const deeplKey = this.localStorageService.get<string>(DEEPL_KEY);
        const baiduAppId = this.localStorageService.get<string>(BAIDU_APP_ID);
        const tencentSecertId = this.localStorageService.get<string>(TENCENT_SECRET_ID);
        return !!deeplKey || !!baiduAppId || !!tencentSecertId;
    }
    // 判断是否可以调用 
    public canIuse(featureName: string): boolean {
        // 本地没有配置，则检查是否可以调用
        const dailyLimit = getAPIDefaultCallTimes(featureName)

        if (dailyLimit === -1) {
            return true; // 该功能没有无限制
        }

        // 看下缓存中今天使用了多少次
        const key = this.getDailyKey(featureName);
        const currentCount = this.localStorageService.get<number>(key) ?? 0;

        // 没有达到上限，则可以调用
        return currentCount < dailyLimit;
    }

    public canUseTranslate(featureName: string): boolean {
        // 本地有配置，则可以调用
        if (this.hasTranslateConfig()) {
            return true;
        }

        return this.canIuse(featureName);
    }


    public canUseGenerateFunctionName(featureName: string): boolean {
        if (this.userService.isVipUser()) {
            return true;
        }

        return this.canIuse(featureName);
    }


    public canUseFeature(featureName: string): boolean {
        let flag = null
        switch (featureName) {
            // 翻译
            case TRANSLATE:
                flag = this.canUseTranslate(featureName);
                break;
            case GENERATE_FUNCTION_NAME:
                flag = this.canUseGenerateFunctionName(featureName);
                break;

            default:
                flag = true;
                break;
        }
        return flag;
    }

    public recordFeatureUse(featureName: string): void {
        const key = this.getDailyKey(featureName);
        const currentCount = this.localStorageService.get<number>(key) ?? 0;
        this.localStorageService.set(key, currentCount + 1);
    }


    public getRemainingUsageText(): string {
        const prefix = '您今天还可以使用:'

        const remainingGenerateFunctionName = this.getRemainingUsage(GENERATE_FUNCTION_NAME, getAPIDefaultCallTimes(GENERATE_FUNCTION_NAME));
        const aiText = this.userService.isVipUser() ? '生成函数名称: 无限次' : `生成函数名称: ${remainingGenerateFunctionName}`

        
        const remainingTranslate = this.getRemainingUsage(TRANSLATE, getAPIDefaultCallTimes(TRANSLATE));
        const translateText = this.hasTranslateConfig() ? '翻译: 无限次' : `翻译: ${remainingTranslate}`

        return prefix + aiText + ';' + translateText;
    }

    private getRemainingUsage(featureName: string, dailyLimit: number): number {
        const key = this.getDailyKey(featureName);
        const currentCount = this.localStorageService.get<number>(key) ?? 0;
        return Math.max(dailyLimit - currentCount, 0); // 确保不返回负数
    }
}
