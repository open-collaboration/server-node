import * as mongo from 'mongodb'
import Project from '../models/project'

export interface IProjectsRepository {
    listProjects(offset: number, limit: number): Promise<Project[]>
    createProject(project: Project): Promise<string>
}

export class ProjectsRepositoryMongo implements IProjectsRepository {
    private collection: mongo.Collection

    constructor(db: mongo.Db) {
        this.collection = db.collection('projects')
    }

    async listProjects(offset: number, limit: number): Promise<Project[]> {
        const docs = await this.collection.find().skip(offset).limit(limit).toArray()

        return docs.map((x) => {
            const project = new Project()

            project.id = x._id
            project.title = x.title ?? ''
            project.shortDescription = x.shortDescription ?? ''
            project.longDescription = x.longDescription ?? ''
            project.title = x.title ?? ''
            project.userId = x.userId ?? ''

            return project
        })
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
}
