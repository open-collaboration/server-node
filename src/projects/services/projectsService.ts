import { validate } from 'class-validator'
import DtoValidationError from '../../share/errors'
import User from '../../users/models/user'
import { PROJECT_DTO_GROUP_CREATE } from '../dtos/dtoGroups'
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
        await this.validateCreateProjectDto(dto)

        // Each user can only own a single project.
        await this.checkUserOwnsAProject(ownerUser)

        const model = this.projectFromDto(dto, ownerUser.id)
        const projectId = await this.projectsRepository.createProject(model)

        const roleModels = this.rolesFromProjectDto(dto, projectId)
        await this.rolesRepository.createRoles(roleModels)

        return projectId
    }

    async validateCreateProjectDto(dto: ProjectDto): Promise<void> {
        const validationErrors = await validate(dto, {
            groups: [PROJECT_DTO_GROUP_CREATE],
        })
        if (validationErrors.length > 0) {
            throw new DtoValidationError(validationErrors)
        }
    }

    async checkUserOwnsAProject(user: User): Promise<void> {
        const project = await this.projectsRepository.getProjectByUserId(user.id)

        if (project !== undefined) {
            throw new Error('User already owns a project')
        }
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
