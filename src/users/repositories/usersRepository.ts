import * as mongo from 'mongodb'
import User from '../models/user'

export interface IUsersRepository {
    getUserByUsername(email: string): Promise<User | undefined>
    getUserById(userId: string): Promise<User | undefined>
    checkForConflict(username: string, email: string): Promise<boolean>
    createUser(user: User): Promise<void>
}

export class UsersRepositoryMongo implements IUsersRepository {
    private collection: mongo.Collection

    constructor(db: mongo.Db) {
        this.collection = db.collection('users')
    }

    // eslint-disable-next-line
    docToUser(doc: any): User {
        const user = new User()

        user.id = doc._id.toString()
        user.email = doc.email ?? ''
        user.username = doc.username ?? ''
        user.password = doc.password ?? ''

        return user
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const doc = await this.collection.findOne({
            username,
        })

        if (doc === undefined) {
            return undefined
        }

        return this.docToUser(doc)
    }

    async getUserById(userId: string): Promise<User | undefined> {
        const doc = await this.collection.findOne({
            _id: new mongo.ObjectId(userId),
        })

        if (doc === undefined) {
            return undefined
        }

        return this.docToUser(doc)
    }

    async checkForConflict(username: string, email: string): Promise<boolean> {
        const doc = await this.collection.findOne({
            $or: [{ username }, { email }],
        }, {
            projection: {
                _id: 1,
            },
        })

        return doc != null
    }

    async createUser(user: User): Promise<void> {
        if (user.id !== undefined) {
            throw new Error('cannot create a user that already has an id')
        }

        const doc = {
            _id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
        }

        await this.collection.insertOne(doc)
    }
}
