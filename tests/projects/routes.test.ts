import 'reflect-metadata'
import request from 'supertest'
import { LoremIpsum } from 'lorem-ipsum'
import Project from '../../src/projects/models/project'
import { IProjectsRepository } from '../../src/projects/repositories/projectsRepository'
import catchUnimplemented from '../helpers/unimplementedCatcher'
import * as server from '../../src/server'
import ProjectSummaryDto from '../../src/projects/dtos/projectSummaryDto'
import { IRolesRepository } from '../../src/projects/repositories/rolesRepository'
import { IProjectsService, ProjectsService } from '../../src/projects/services/projectsService'
import { ISessionsService } from '../../src/users/sessionsService'
import User from '../../src/users/models/user'

const lorem = new LoremIpsum()

describe('project routes', () => {
    let app: Express.Application
    let projectsRepo: IProjectsRepository
    let rolesRepo: IRolesRepository
    let projectsService: IProjectsService
    let sessionsService: ISessionsService

    beforeEach(async () => {
        const fakeProjectSummaries = [
            new Project(),
            new Project(),
            new Project(),
            new Project(),
        ].map((x, i) => {
            // eslint-disable-next-line no-param-reassign
            x.id = i.toString()
            return x
        })

        projectsRepo = catchUnimplemented<IProjectsRepository>({
            createProject: async (project) => 'random project id',
            listProjects: async (offset, limit) => fakeProjectSummaries.slice(offset, limit),
            getProjectByUserId: async (userId) => undefined,
        })

        rolesRepo = catchUnimplemented<IRolesRepository>({
            createRoles: async (roles) => roles.map((_, i) => i.toString()),
        })

        projectsService = new ProjectsService(projectsRepo, rolesRepo)
        sessionsService = catchUnimplemented<ISessionsService>({
            async getSession(token) {
                if (token === 'validsessiontoken') {
                    const user = new User()
                    user.id = 'someuser'
                    return user
                }

                return undefined
            },
        })

        app = await server.createApp(
            projectsRepo,
            catchUnimplemented({}),
            sessionsService,
            projectsService,
        )
    })

    describe('create project', () => {
        const validProject = {
            title: 'test project',
            shortDescription: 'this is a very short description about the test project',
            longDescription: lorem.generateParagraphs(2),
            roles: [
                {
                    title: 'this is a role',
                    description: lorem.generateWords(30),
                    skills: ['skill one', 'skill two'],
                },
            ],
        }

        it('should create a project', () => request(app)
            .post('/projects')
            .set('Cookie', ['session=validsessiontoken'])
            .send(validProject)
            .expect(201))

        it('should reject project with id', () => request(app)
            .post('/projects')
            .set('Cookie', ['session=validsessiontoken'])
            .send({
                ...validProject,
                id: 'randomid',
            })
            .expect(400))

        it('should reject a project with a role with id', () => request(app)
            .post('/projects')
            .set('Cookie', ['session=validsessiontoken'])
            .send({
                ...validProject,
                roles: [
                    {
                        ...validProject.roles[0],
                        id: 'randomroleid',
                    },
                ],
            })
            .expect(400))

        it('should reject a project without any roles', () => request(app)
            .post('/projects')
            .set('Cookie', ['session=validsessiontoken'])
            .send({
                ...validProject,
                roles: [],
            })
            .expect(400))

        it('should reject a request without a session token', () => request(app)
            .post('/projects')
            .send(validProject)
            .expect(401))
    })

    describe('list projects', () => {
        const cases: { ids: string[], offset?: number, limit?: number }[] = [
            {
                ids: ['0', '1', '2', '3'],
            },
            {
                offset: 2,
                ids: ['2', '3'],
            },
            {
                offset: -1,
                ids: ['0', '1', '2', '3'],
            },
            {
                limit: 1,
                offset: 3,
                ids: ['3'],
            },
            {
                limit: -1,
                ids: ['0', '1', '2', '3'],
            },
            {
                limit: 0,
                ids: ['0', '1', '2', '3'],
            },
            {
                limit: 1,
                ids: ['0'],
            },
        ]

        for (const [i, testCase] of Object.entries(cases)) {
            it(`case ${i}`, async () => {
                await request(app)
                    .get('/projects')
                    .query({
                        offset: testCase.offset,
                        limit: testCase.limit,
                    })
                    .expect(200)
                    .expect((res) => {
                        const ids = (res.body as ProjectSummaryDto[]).map((x) => x.id)
                        const idsMatch = ids
                            .every((id) => id !== undefined && testCase.ids.includes(id))

                        if (!idsMatch) {
                            throw new Error(`The returned projects dont match the expected projects. Returned ids: ${ids}, Expected ids: ${testCase.ids}`)
                        }
                    })
            })
        }
    })
})
