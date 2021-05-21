import { User, UserModel } from '../models/user'

export interface IUsersRepository {
    getUserByUsername(email: string): Promise<User | undefined>
    checkForConflict(username: string, email: string): Promise<boolean>
    createUser(user: User): Promise<void>
}

export class UsersRepositoryMongo implements IUsersRepository {
    async getUserByUsername(username: string): Promise<User | undefined> {
        const doc = await UserModel.findOne({
            username,
        }).exec()

        if (doc === null) {
            return undefined
        }

        return doc
    }

    async checkForConflict(username: string, email: string): Promise<boolean> {
        return await UserModel.exists({ username }) || await UserModel.exists({ email })
    }

    async createUser(user: User): Promise<void> {
        await UserModel.create(user)
    }
}
