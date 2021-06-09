import User from '../../users/models/user'
import ProjectDto from '../dtos/projectDto'
import Project from '../models/project'
import Role from '../models/role'
import { IProjectsRepository } from '../repositories/projectsRepository'
import { IRolesRepository } from '../repositories/rolesRepository'

export interface IProjectsService {
    createProject(dto: ProjectDto, user: User): Promise<string>
}

export class ProjectsService implements IProjectsService {
    constructor(
        private projectsRepository: IProjectsRepository,
        private rolesRepository: IRolesRepository,
    ) {}

    async createProject(dto: ProjectDto, ownerUser: User): Promise<string> {
        if (ownerUser.id === undefined) {
            // remove this shit, use a different type for user with id and without
            throw new Error('user does not have id')
        }

        // Check if user already owns a project.
        // Each user can only own a single project.
        const existingProject = await this.projectsRepository.getProjectByUserId(ownerUser.id)
        if (existingProject !== undefined) {
            throw new Error('User already owns a project')
        }

        // Check if roles dont have an id (as we cannot create a role that already exists)
        if (!dto.roles.every((x) => x.id === undefined)) {
            throw new Error('One or more roles already have IDs')
        }

        const model = this.projectFromDto(dto, ownerUser.id)
        const projectId = await this.projectsRepository.createProject(model)

        const roleModels = this.rolesFromProjectDto(dto, projectId)
        await this.rolesRepository.createRoles(roleModels)

        return projectId
    }

    projectFromDto(dto: ProjectDto, userId: string): Project {
        const model = new Project()

        model.title = dto.title
        model.shortDescription = dto.shortDescription
        model.longDescription = dto.longDescription
        model.userId = userId

        return model
    }

    rolesFromProjectDto(projectDto: ProjectDto, projectId: string): Role[] {
        return projectDto.roles.map((x) => {
            const role = new Role()

            role.projectId = projectId
            role.title = x.title
            role.skills = x.skills
            role.description = x.description

            return role
        })
    }
}
