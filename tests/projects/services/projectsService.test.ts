/* eslint-disable max-classes-per-file */
import { assert } from 'chai'
import { LoremIpsum } from 'lorem-ipsum'
import { v4 } from 'uuid'
import ProjectDto from '../../../src/projects/dtos/projectDto'
import RoleDto from '../../../src/projects/dtos/roleDto'
import Project from '../../../src/projects/models/project'
import Role from '../../../src/projects/models/role'
import { IProjectsRepository } from '../../../src/projects/repositories/projectsRepository'
import { IRolesRepository } from '../../../src/projects/repositories/rolesRepository'
import { IProjectsService, ProjectsService } from '../../../src/projects/services/projectsService'
import User from '../../../src/users/models/user'
import catchUnimplemented from '../../helpers/unimplementedCatcher'

const lorem = new LoremIpsum()

class FakeProjectsRepository implements Partial<IProjectsRepository> {
    projectsStore: Project[] = []

    async getProjectByUserId(id: string): Promise<Project | undefined> {
        return this.projectsStore.find((x) => x.userId === id)
    }

    async createProject(project: Project): Promise<string> {
        const id = v4()
        this.projectsStore.push(Object.assign(new Project(), project, { id }))
        return id
    }
}

class FakeRolesRepository implements Partial<IRolesRepository> {
    rolesStore: Role[] = []

    async createRoles(roles: Role[]): Promise<string[]> {
        const rolesWithIds = roles
            .map((x) => Object.assign(new Role(), x, { id: v4() }))
        this.rolesStore.push(...rolesWithIds)
        return rolesWithIds.map((x) => x.id)
    }
}

describe('projects service', () => {
    let fakeProjectsRepository: FakeProjectsRepository
    let fakeRolesRepository: FakeRolesRepository
    let projectsService: IProjectsService

    beforeEach(() => {
        fakeProjectsRepository = new FakeProjectsRepository()
        fakeRolesRepository = new FakeRolesRepository()

        projectsService = new ProjectsService(
            catchUnimplemented<IProjectsRepository>(fakeProjectsRepository),
            catchUnimplemented<IRolesRepository>(fakeRolesRepository),
        )
    })

    describe('create project', () => {
        it('should create a project and its roles', async () => {
            const user = new User()
            user.id = 'someuser'

            const dto = new ProjectDto()
            dto.longDescription = lorem.generateParagraphs(2)
            dto.shortDescription = lorem.generateSentences(2)
            dto.title = lorem.generateWords(2)
            dto.roles = [
                Object.assign(new RoleDto(), {
                    description: lorem.generateSentences(1),
                    skills: ['random', 'skill'],
                    title: lorem.generateWords(2),
                } as Partial<RoleDto>),
                Object.assign(new RoleDto(), {
                    description: lorem.generateSentences(1),
                    skills: ['random2', 'skill2'],
                    title: lorem.generateWords(2),
                } as Partial<RoleDto>),
            ]

            const projectId = await projectsService.createProject(dto, user)

            console.log('wtf')

            const project = fakeProjectsRepository.projectsStore.find((x) => x.id === projectId)
            assert(project !== undefined)
        })

        it('should reject a project without roles', async () => {
            const user = new User()
            user.id = 'someuser'

            const dto = new ProjectDto()
            dto.longDescription = lorem.generateParagraphs(2)
            dto.shortDescription = lorem.generateSentences(2)
            dto.title = lorem.generateWords(2)
            dto.roles = []

            let rejected = false
            await projectsService.createProject(dto, user).catch(() => { rejected = true })
            assert(rejected)
            assert(fakeProjectsRepository.projectsStore.length === 0)
        })

        it('should reject a project with an id', async () => {
            const user = new User()
            user.id = 'someuser'

            const dto = new ProjectDto()
            dto.id = v4()
            dto.longDescription = lorem.generateParagraphs(2)
            dto.shortDescription = lorem.generateSentences(2)
            dto.title = lorem.generateWords(2)
            dto.roles = [
                Object.assign(new RoleDto(), {
                    description: lorem.generateSentences(1),
                    skills: ['random', 'skill'],
                    title: lorem.generateWords(2),
                } as Partial<RoleDto>),
                Object.assign(new RoleDto(), {
                    description: lorem.generateSentences(1),
                    skills: ['random2', 'skill2'],
                    title: lorem.generateWords(2),
                } as Partial<RoleDto>),
            ]

            let rejected = false
            await projectsService.createProject(dto, user).catch(() => { rejected = true })
            assert(rejected)
            assert(fakeProjectsRepository.projectsStore.length === 0)
        })

        it('should reject a project that has roles with ids', async () => {
            const user = new User()
            user.id = 'someuser'

            const dto = new ProjectDto()
            dto.longDescription = lorem.generateParagraphs(2)
            dto.shortDescription = lorem.generateSentences(2)
            dto.title = lorem.generateWords(2)
            dto.roles = [
                Object.assign(new RoleDto(), {
                    id: v4(),
                    description: lorem.generateSentences(1),
                    skills: ['random', 'skill'],
                    title: lorem.generateWords(2),
                } as Partial<RoleDto>),
                Object.assign(new RoleDto(), {
                    id: v4(),
                    description: lorem.generateSentences(1),
                    skills: ['random2', 'skill2'],
                    title: lorem.generateWords(2),
                } as Partial<RoleDto>),
            ]

            let rejected = false
            await projectsService.createProject(dto, user).catch(() => { rejected = true })
            assert(rejected)
            assert(fakeProjectsRepository.projectsStore.length === 0)
        })
    })
})
