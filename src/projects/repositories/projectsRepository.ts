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

        project.id = doc._id.toString()
        project.title = doc.title ?? ''
        project.shortDescription = doc.shortDescription ?? ''
        project.longDescription = doc.longDescription ?? ''
        project.title = doc.title ?? ''
        project.userId = doc.userId ?? ''

        return project
    }

    /**
     *
     * @param offset Number of projects to skip in the query
     * @param limit Number of projects returned in the query
     * @param summary Whether the query should return only the summary of the project
     * (id, title and short description)
     * @returns
     */
    async listProjects(offset: number, limit: number, summary = true): Promise<Project[]> {
        const docs = await this.collection.find({}, {
            projection: {
                _id: 1,
                title: 1,
                shortDescription: 1,
            },
        }).skip(offset).limit(limit).toArray()

        return docs.map(this.docToProject)
    }

    async createProject(project: Project): Promise<string> {
        if (project.id !== '') {
            throw new Error('cannot create a project that already has an id')
        }

        const doc = {
            _id: new mongo.ObjectId(),
            title: project.title,
            shortDescription: project.shortDescription,
            longDescription: project.longDescription,
            userId: project.userId,
        }

        return (await this.collection.insertOne(doc)).insertedId.toString()
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
