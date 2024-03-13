import { Memento } from 'vscode';

export class LocalStorageService {
    constructor(private storage: Memento) {}

    public async set<T>(key: string, value: T, expiryInMilliseconds?: number): Promise<void> {
        expiryInMilliseconds = expiryInMilliseconds ? expiryInMilliseconds : 24 * 60 * 60 * 1000 * 365 * 10
        const expiryTimestamp = new Date().getTime() + expiryInMilliseconds;
        const data = { value, expiryTimestamp };
        await this.storage.update(key, data);
    }

    public get<T>(key: string): T | undefined {
        const data = this.storage.get<{ value: T; expiryTimestamp: number }>(key);
        if (!data) {
            return undefined;
        }
        const now = new Date().getTime();
        if (now > data.expiryTimestamp) {
            // 数据已过期，可选择在这里自动删除
            this.storage.update(key, undefined);
            return undefined;
        }
        return data.value;
    }

    public async delete(key: string): Promise<void> {
        await this.storage.update(key, undefined);
    }

    public async update<T>(key: string, value: T, expiryInMilliseconds: number): Promise<void> {
        await this.set(key, value, expiryInMilliseconds);
    }
}
