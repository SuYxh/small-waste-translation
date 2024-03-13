import { LocalStorageService } from './storage';
import { UserService } from './UserService';
import { TRANSLATE, GENERATE_FUNCTION_NAME } from '@/const';
import { getAPIDefaultCallTimes } from './utils';

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

    public canUseFeature(featureName: string): boolean {
        if (this.userService.isVipUser()) {
            return true; // VIP用户无限制
        }

        const dailyLimit = getAPIDefaultCallTimes(featureName)
        if (dailyLimit === -1) {
            return true; // 该功能没有无限制
        }

        const key = this.getDailyKey(featureName);
        const currentCount = this.localStorageService.get<number>(key) ?? 0;

        return currentCount < dailyLimit;
    }

    public recordFeatureUse(featureName: string): void {
        const key = this.getDailyKey(featureName);
        const currentCount = this.localStorageService.get<number>(key) ?? 0;
        this.localStorageService.set(key, currentCount + 1);
    }


    public getRemainingUsageText(): string {
        if (this.userService.isVipUser()) {
            return "作为VIP用户，您可以无限制使用所有功能。";
        }

        const remainingTranslate = this.getRemainingUsage(TRANSLATE, getAPIDefaultCallTimes(TRANSLATE));
        const remainingGenerateFunctionName = this.getRemainingUsage(GENERATE_FUNCTION_NAME, getAPIDefaultCallTimes(GENERATE_FUNCTION_NAME));

        return `您今天还可以使用翻译功能${remainingTranslate}次，生成函数名功能${remainingGenerateFunctionName}次。`;
    }

    private getRemainingUsage(featureName: string, dailyLimit: number): number {
        const key = this.getDailyKey(featureName);
        const currentCount = this.localStorageService.get<number>(key) ?? 0;
        return Math.max(dailyLimit - currentCount, 0); // 确保不返回负数
    }
}
