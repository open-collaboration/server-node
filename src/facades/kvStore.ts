import { Callback, RedisClient } from 'redis'
import { promisify } from 'util'

/**
 * A facade to interact with a Key Value store, such as Redis.
 */
export interface IKVStore {

    /**
     * Get a string value from the store.
     * @param key the value's key
     */
    get(key: string): Promise<string | undefined>

    /**
     * Set a string value in the store
     * @param key The key for the value
     * @param value The value to store
     */
    set(key: string, value: string): Promise<void>

    /**
     * Delete a key from the store.
     */
    remove(key: string): Promise<void>

    /**
     * Add a value to a set.
     * @param key The set's key
     * @param value The value to add
     */
    setAdd(key: string, value: string): Promise<void>

    /**
     * Get all values from a set
     * @param key The set's key
     */
    setGet(key: string): Promise<string[] | undefined>
}

/**
 * An implementation of a KVStore facade to interact with Redis.
 */
export class KVStoreRedis implements IKVStore {
    constructor(private redis: RedisClient) {}

    async get(key: string): Promise<string | undefined> {
        const result = await promisify(this.redis.get).bind(this.redis)(key)
        if (result === null) {
            return undefined
        }

        return result
    }

    async set(key: string, value: string): Promise<void> {
        await promisify(this.redis.set).bind(this.redis)(key, value)
    }

    async setAdd(key: string, value: string): Promise<void> {
        const sadd = this.redis.sadd as
            (key: string, arg1: string, cb?: Callback<number>) => boolean

        await promisify(sadd).bind(this.redis)(key, value)
    }

    setGet(key: string): Promise<string[]> {
        return promisify(this.redis.smembers).bind(this.redis)(key)
    }

    async remove(key: string): Promise<void> {
        const del = this.redis.del as (arg1: string, cb?: Callback<number>) => boolean

        await promisify(del).bind(this.redis)(key)
    }
}
