import { Project, ProjectModel } from '../models/project'

export interface IProjectsRepository {
    listProjects(offset: number, limit: number): Promise<Project[]>
    createProject(project: Project): Promise<void>
}

export class ProjectsRepository implements IProjectsRepository {
    listProjects(offset: number, limit: number): Promise<Project[]> {
        return ProjectModel.find().skip(offset).limit(limit).exec()
    }

    async createProject(project: Project): Promise<void> {
        await ProjectModel.create(project)
    }
}
