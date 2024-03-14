import { Memento } from 'vscode';
import { setSystemDefaultValue } from '@/utils';

export class LocalStorageService {
    private readonly allKeysStorageKey = '__allKeys'; // 用于存储所有键的特殊键

    constructor(private storage: Memento) {}

    private async updateAllKeys(key: string, remove: boolean = false): Promise<void> {
        let allKeys = await this.storage.get<string[]>(this.allKeysStorageKey, []);
        if (remove) {
            allKeys = allKeys.filter(k => k !== key); // 删除键
        } else if (!allKeys.includes(key)) {
            allKeys.push(key); // 添加新键
        }
        await this.storage.update(this.allKeysStorageKey, allKeys);
    }

    public async set<T>(key: string, value: T, expiryInMilliseconds?: number): Promise<void> {
        expiryInMilliseconds = expiryInMilliseconds || 24 * 60 * 60 * 1000 * 365 * 10;
        const expiryTimestamp = new Date().getTime() + expiryInMilliseconds;
        const data = { value, expiryTimestamp };
        console.log('set-data', key, data)

        await this.storage.update(key, data);
        await this.updateAllKeys(key); // 更新包含所有键的数组
    }

    public get<T>(key: string): T | undefined {
        const data = this.storage.get<{ value: T; expiryTimestamp: number }>(key);
        console.log('get-data', key, data)
        if (!data) {
            return undefined;
        }
        const now = new Date().getTime();
        if (now > data.expiryTimestamp) {
            console.log('数据过期了')
            this.delete(key); // 如果数据过期，自动删除
            return undefined;
        }
        return data.value;
    }

    public async delete(key: string): Promise<void> {
        await this.storage.update(key, undefined);
        await this.updateAllKeys(key, true); // 从包含所有键的数组中删除此键
    }

    public async getAllDataAsString(): Promise<string> {
        const allKeys = await this.storage.get<string[]>(this.allKeysStorageKey, []);
        const allData: { [key: string]: any } = {};
        for (const key of allKeys) {
            const data = await this.storage.get<{ value: any; expiryTimestamp: number }>(key);
            if (data) {
                allData[key] = data.value;
            }
        }

        console.log('allKeys', allKeys)
        console.log('allData', allData)
        return JSON.stringify(allData);
    }

    public async clearAllData(): Promise<void> {
        const allKeys = await this.storage.get<string[]>(this.allKeysStorageKey, []);
        for (const key of allKeys) {
            await this.storage.update(key, undefined);
        }
        await this.storage.update(this.allKeysStorageKey, undefined); // 同时清除维护键的数组

        // 清理结束后，设置系统默认值
        // setTimeout(() => {
        //     setSystemDefaultValue();
        // }, 1000);
    }

    public async update<T>(key: string, value: T, expiryInMilliseconds: number): Promise<void> {
        await this.set(key, value, expiryInMilliseconds);
    }
}
