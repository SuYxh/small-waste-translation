export class DIContainer {
  private static _instance: DIContainer;
  private _services: Map<string, any> = new Map();

  private constructor() {}

  public static get instance() {
      if (!this._instance) {
          this._instance = new DIContainer();
      }
      return this._instance;
  }

  public register(key: string, instance: any) {
      this._services.set(key, instance);
  }

  public get<T>(key: string): T {
      const service = this._services.get(key);
      if (!service) {
          throw new Error(`Service ${key} not found`);
      }
      return service;
  }
}