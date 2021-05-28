import { v4 } from 'uuid'
import { IKVStore } from '../facades/kvStore'
import User from './models/user'

/**
 * A service for managing user sessions.
 */
export interface ISessionsService {
    createSession(user: User): Promise<string>

    /**
     * Get a session's user id if it exists
     * @param sessionToken The session token
     * @returns The user id if the session exists
     */
    getSession(sessionToken: string): Promise<string | undefined>

    revokeSessions(user: User): Promise<void>
}

/**
 * Implements a sessions service that uses a KVStore to
 * store the session data.
 *
 * When a session is created two things happen:
 * 1. A key that maps the session token to a user id is created.
 * 2. The session token is stored in a set that contains all of
 * a user's session tokens. This is called the reverse index. It's
 * used to retrieve all sessions of a user so that we can revoke (delete)
 * them.
 *
 * @see SessionsServiceKvStore.userByToken
 * @see SessionsServiceKvStore.tokensByUser
 */
export class SessionsServiceKvStore implements ISessionsService {
    constructor(private store: IKVStore) {}

    /**
     * Get the store key that maps a session token to a user id.
     * @returns a store key to a string that contains the if of
     *  the user that owns the session.
     */
    private userByToken(token: string): string {
        return `session:${token}:user.id`
    }

    /**
     * Get the sessions reverse index store key.
     * @returns a store key to a set that contains all active tokens a user owns.
     */
    private tokensByUser(userId: string): string {
        return `user:${userId}:session.keys`
    }

    async createSession(user: User): Promise<string> {
        if (user.id === undefined) {
            throw new Error('User does not have id')
        }

        const token = v4()

        // TODO: do transaction
        await this.store.set(this.userByToken(token), user.id)
        await this.store.setAdd(this.tokensByUser(user.id), token)

        return token
    }

    getSession(sessionToken: string): Promise<string | undefined> {
        return this.store.get(this.userByToken(sessionToken))
    }

    async revokeSessions(user: User): Promise<void> {
        if (user.id === undefined) {
            throw new Error('User does not have id')
        }

        const sessionTokens = await this.store.setGet(this.tokensByUser(user.id))
        if (sessionTokens === undefined) {
            return
        }

        const promises = sessionTokens.map((token) => this.store.remove(this.userByToken(token)))

        await Promise.all([
            ...promises,
            this.store.remove(this.tokensByUser(user.id)),
        ])
    }
}
