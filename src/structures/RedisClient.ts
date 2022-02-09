import Redis from "ioredis";

export class RedisClient extends Redis {
    public constructor(params: any) {
        super(params);
    }

    public set(key: Redis.KeyType, value: any): Promise<"OK" | null> {
        return super.set(key, JSON.stringify(value));
    }

    public async get(key: Redis.KeyType): Promise<any> {
        const data = await super.get(key);
        return JSON.parse(data as any);
    }
}
