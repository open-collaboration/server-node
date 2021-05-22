import request from 'supertest'
import { LoremIpsum } from 'lorem-ipsum'
import Project from '../../src/projects/models/project'
import { IProjectsRepository } from '../../src/projects/repositories/projectsRepository'
import catchUnimplemented from '../helpers/unimplementedCatcher'
import * as server from '../../src/server'
import ProjectDto from '../../src/projects/dtos/projectDto'

const lorem = new LoremIpsum()

describe('project routes', () => {
    let app: Express.Application
    let repo: IProjectsRepository

    beforeEach(async () => {
        const fakeProjects = [
            new Project(),
            new Project(),
            new Project(),
            new Project(),
        ].map((x, i) => {
            // eslint-disable-next-line no-param-reassign
            x.id = i.toString()
            return x
        })

        repo = catchUnimplemented({
            createProject: (project) => {},
            listProjects: async (offset, limit) => fakeProjects.slice(offset, limit),
        } as IProjectsRepository)

        app = await server.createApp(repo, catchUnimplemented({}))
    })

    describe('create project', () => {
        it('should create a project', (done) => {
            request(app)
                .post('/projects')
                .send({
                    title: 'test project',
                    shortDescription: 'this is a very short description about the test project',
                    longDescription: lorem.generateParagraphs(2),
                })
                .expect(201)
                .then(() => done())
                .catch(done)
        })

        it('should reject project with id', (done) => {
            request(app)
                .post('/projects')
                .send({
                    id: 'randomid',
                    title: 'test project',
                    shortDescription: 'this is a very short description about the test project',
                    longDescription: lorem.generateParagraphs(2),
                })
                .expect(400)
                .then(() => done())
                .catch(done)
        })
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
                        const ids = (res.body as ProjectDto[]).map((x) => x.id)
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
