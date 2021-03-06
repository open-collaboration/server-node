import express from 'express'
import 'reflect-metadata' // Needed for class-transform
import { MongoClient } from 'mongodb'
import * as redis from 'redis'
import cookieParser from 'cookie-parser'
import { KVStoreRedis } from './facades/kvStore'
import { Logger } from './logger'
import attachRequestContext from './middleware/attachContext'
import attachRequestId from './middleware/requestId'
import { IProjectsRepository, ProjectsRepositoryMongo } from './projects/repositories/projectsRepository'
import ProjectRoutes from './projects/routes'
import { IUsersRepository, UsersRepositoryMongo } from './users/repositories/usersRepository'
import UserRoutes from './users/routes'
import { ISessionsService, SessionsServiceKvStore } from './users/services/sessionsService'
import { RolesRepositoryMongo } from './projects/repositories/rolesRepository'
import { IProjectsService, ProjectsService } from './projects/services/projectsService'

export async function createApp(
    projectsRepository: IProjectsRepository,
    usersRepository: IUsersRepository,
    sessionsService: ISessionsService,
    projectsService: IProjectsService,
): Promise<express.Application> {
    const logger = Logger.create()
    const app = express()

    app.use(attachRequestContext)
    app.use(attachRequestId)
    app.use(express.json())
    app.use(cookieParser())

    logger.info('setting up routes')
    ProjectRoutes(app, projectsRepository, sessionsService, projectsService)
    UserRoutes(app, usersRepository, sessionsService)

    return app
}

export async function bootstrap(): Promise<void> {
    const logger = Logger.create()

    logger.info('connecting to db')
    const mongoClient = await new MongoClient('mongodb://root:changeme@localhost:27017', { useUnifiedTopology: true }).connect()
    const mongoDb = mongoClient.db('opencollab')

    const redisClient = redis.createClient('//localhost:6379')
    const redisKvStore = new KVStoreRedis(redisClient)

    const projectsRepository = new ProjectsRepositoryMongo(mongoDb)
    const usersRepository = new UsersRepositoryMongo(mongoDb)
    const rolesRepository = new RolesRepositoryMongo(mongoDb)

    const sessionsService = new SessionsServiceKvStore(redisKvStore, usersRepository)
    const projectsService = new ProjectsService(projectsRepository, rolesRepository)

    const app = await createApp(
        projectsRepository,
        usersRepository,
        sessionsService,
        projectsService,
    )

    logger.info('starting server')
    app.listen(3000)
}
