import * as mongo from 'mongodb'
import Role from '../models/role'

export interface IRolesRepository {
    createRoles(roles: Role[]): Promise<string[]>
    getRoleById(id: string): Promise<Role | undefined>
    getRolesByProjectId(project: string): Promise<Role[] | undefined>
}

export class RolesRepositoryMongo implements IRolesRepository {
    private collection: mongo.Collection

    constructor(db: mongo.Db) {
        this.collection = db.collection('roles')
    }

    private docToRole(doc: any): Role {
        const role = new Role()

        role.id = doc._id.toString()
        role.projectId = doc.projectId ?? ''
        role.title = doc.title ?? ''
        role.description = doc.description ?? ''
        role.skills = doc.skills ?? []

        return role
    }

    private roleToDoc(role: Role): any {
        return {
            _id: role.hasId() ? new mongo.ObjectId(role.id) : new mongo.ObjectId(),
            projectId: role.projectId,
            title: role.title,
            description: role.description,
            skills: role.skills,
        }
    }

    async createRoles(roles: Role[]): Promise<string[]> {
        if (roles.filter((x) => x.id !== '').length > 0) {
            throw new Error('Cannot create a role that already has an id')
        }

        const docs = roles.map(this.roleToDoc)

        const { insertedIds } = await this.collection.insertMany(docs)

        return Object.values(insertedIds).map((x) => x.toString())
    }

    async getRoleById(id: string): Promise<Role | undefined> {
        const doc = await this.collection.findOne({
            _id: new mongo.ObjectId(id),
        })

        return this.docToRole(doc)
    }

    async getRolesByProjectId(projectId: string): Promise<Role[] | undefined> {
        const docs = await this.collection.find({
            projectId,
        }).toArray()

        return docs.map(this.docToRole)
    }
}
