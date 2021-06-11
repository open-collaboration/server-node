import assert from 'assert'
import { v4 } from 'uuid'
import { IKVStore } from '../../../src/facades/kvStore'
import User from '../../../src/users/models/user'
import { IUsersRepository } from '../../../src/users/repositories/usersRepository'
import { ISessionsService, SessionsServiceKvStore } from '../../../src/users/services/sessionsService'
import InMemoryKvStore from '../../helpers/inMemoryKvStore'
import catchUnimplemented from '../../helpers/unimplementedCatcher'

describe('sessions service', () => {
    let sessionsService: ISessionsService
    let user: User

    beforeEach(() => {
        user = new User()
        user.id = v4()

        const usersRepository = catchUnimplemented<IUsersRepository>({
            async getUserById(id) {
                return id === user.id ? user : undefined
            },
        })
        const kvStore: IKVStore = new InMemoryKvStore()

        sessionsService = new SessionsServiceKvStore(kvStore, usersRepository)
    })

    it('should create a session', async () => {
        const token = await sessionsService.createSession(user)
        const sessionUser = await sessionsService.getSession(token)

        assert(sessionUser !== undefined)
        assert(sessionUser.id === user.id)
    })

    it('should revoke all of a user\'s sessions', async () => {
        const token1 = await sessionsService.createSession(user)
        const token2 = await sessionsService.createSession(user)

        await sessionsService.revokeSessions(user)

        const sessionUser1 = await sessionsService.getSession(token1)
        const sessionUser2 = await sessionsService.getSession(token2)

        assert(sessionUser1 === undefined)
        assert(sessionUser2 === undefined)
    })
})
