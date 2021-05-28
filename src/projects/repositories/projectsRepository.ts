import * as mongo from 'mongodb'
import Project from '../models/project'

export interface IProjectsRepository {
    listProjects(offset: number, limit: number): Promise<Project[]>
    createProject(project: Project): Promise<string>
    getProjectByUserId(userId: string): Promise<Project | undefined>
    getProjectById(id: string): Promise<Project | undefined>
    deleteProjectById(id: string): Promise<void>
}

export class ProjectsRepositoryMongo implements IProjectsRepository {
    private collection: mongo.Collection

    constructor(db: mongo.Db) {
        this.collection = db.collection('projects')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private docToProject(doc: any): Project {
        const project = new Project()

        project.id = doc._id
        project.title = doc.title ?? ''
        project.shortDescription = doc.shortDescription ?? ''
        project.longDescription = doc.longDescription ?? ''
        project.title = doc.title ?? ''
        project.userId = doc.userId ?? ''

        return project
    }

    async listProjects(offset: number, limit: number): Promise<Project[]> {
        const docs = await this.collection.find().skip(offset).limit(limit).toArray()

        return docs.map(this.docToProject)
    }

    async createProject(project: Project): Promise<string> {
        if (project.id !== undefined) {
            throw new Error('Cannot create a project that already has an id')
        }

        const doc = {
            _id: project.id,
            title: project.title,
            shortDescription: project.shortDescription,
            longDescription: project.longDescription,
            userId: project.userId,
        }

        return (await this.collection.insertOne(doc)).insertedId
    }

    async getProjectByUserId(userId: string): Promise<Project | undefined> {
        const doc = await this.collection.findOne({
            userId,
        })

        if (doc == null) {
            return undefined
        }

        return this.docToProject(doc)
    }

    async getProjectById(id: string): Promise<Project | undefined> {
        const doc = await this.collection.findOne({
            _id: new mongo.ObjectId(id),
        })

        if (doc == null) {
            return undefined
        }

        return this.docToProject(doc)
    }

    async deleteProjectById(id: string): Promise<void> {
        await this.collection.deleteOne({
            _id: new mongo.ObjectId(id),
        })
    }
}
