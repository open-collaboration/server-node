import request from 'supertest'
import { LoremIpsum } from 'lorem-ipsum'
import Project from '../../src/projects/models/project'
import { IProjectsRepository } from '../../src/projects/repositories/projectsRepository'
import catchUnimplemented from '../helpers/unimplementedCatcher'
import * as server from '../../src/server'

const lorem = new LoremIpsum()

describe('project routes', () => {
    let app: Express.Application
    let repo: IProjectsRepository

    beforeEach(async () => {
        repo = catchUnimplemented({
            createProject: (project) => {},
            listProjects: async (offset, limit) => [
                new Project(),
                new Project(),
                new Project(),
                new Project(),
            ],
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
        it('should list all projects', () => {

        })
    })
})
