import { ILocalCache } from "./ILocalCache";
import * as Objects from "../objects";

export class MemoryCache implements ILocalCache {
    private cacheObject: Object;

    constructor() {
        this.cacheObject = {};
    }

    public async getKeys(): Promise<string[]> {
        return Object.keys(this.cacheObject);
    }

    public async setItem(key: string, value: any): Promise<void> {
        this.cacheObject[key] = JSON.stringify(value);
    }

    public async getItem<T>(key: string): Promise<T> {
        return Objects.clone<T>(this.cacheObject[key]);
    }

    public async getOccupiedSpace(): Promise<number> {
        return 0;
    }

    public async getRemainingSpace(): Promise<number> {
        return 0;
    }

    public addChangeListener(callback: () => void): void {
        // Do nothing
    }

    public async removeItem(key: string): Promise<void> {
        delete this.cacheObject[key];
    }

    public async clear(): Promise<void> {
        this.cacheObject = {};
    }
}