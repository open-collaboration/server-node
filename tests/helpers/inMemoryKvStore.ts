import { IKVStore } from '../../src/facades/kvStore'

export default class InMemoryKvStore implements IKVStore {
    strings: Record<string, string> = {}

    sets: Record<string, string[]> = {}

    async get(key: string): Promise<string | undefined> {
        return this.strings[key]
    }

    async set(key: string, value: string): Promise<void> {
        if (this.sets[key] !== undefined) {
            throw new Error(`key ${key} already exists and is a set, not a string`)
        }

        this.strings[key] = value
    }

    async remove(key: string): Promise<void> {
        delete this.strings[key]
        delete this.sets[key]
    }

    async setAdd(key: string, value: string): Promise<void> {
        if (this.strings[key] !== undefined) {
            throw new Error(`key ${key} already exists and is a string, not a set`)
        }

        this.sets[key] = (this.sets[key] ?? [])
        this.sets[key].push(value)
    }

    async setGet(key: string): Promise<string[] | undefined> {
        return this.sets[key]
    }
}
