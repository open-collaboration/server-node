import express from 'express'
import { MongoClient } from 'mongodb'
import { Logger } from './logger'
import attachRequestContext from './middleware/attachContext'
import attachRequestId from './middleware/requestId'
import { IProjectsRepository, ProjectsRepositoryMongo } from './projects/repositories/projectsRepository'
import ProjectRoutes from './projects/routes'
import { IUsersRepository, UsersRepositoryMongo } from './users/repositories/usersRepository'
import UserRoutes from './users/routes'

export async function createApp(
    projectsRepository: IProjectsRepository,
    usersRepository: IUsersRepository,
): Promise<express.Application> {
    const logger = Logger.create()
    const app = express()

    app.use(attachRequestContext)
    app.use(attachRequestId)
    app.use(express.json())

    logger.info('setting up routes')
    ProjectRoutes(app, projectsRepository)
    UserRoutes(app, usersRepository)

    return app
}

export async function bootstrap(): Promise<void> {
    const logger = Logger.create()

    logger.info('connecting to db')
    const mongoClient = await new MongoClient('mongodb://root:changeme@localhost:27017', { useUnifiedTopology: true }).connect()
    const mongoDb = mongoClient.db('opencollab')

    const projectsRepository = new ProjectsRepositoryMongo(mongoDb)
    const usersRepository = new UsersRepositoryMongo(mongoDb)

    const app = await createApp(projectsRepository, usersRepository)

    logger.info('starting server')
    app.listen(3000)
}
