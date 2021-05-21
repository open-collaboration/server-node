import bodyParser from 'body-parser'
import express from 'express'
import mongoose from 'mongoose'
import { IProjectsRepository, ProjectsRepositoryMongo } from './projects/repositories/projectsRepository'
import ProjectRoutes from './projects/routes'
import { IUsersRepository, UsersRepositoryMongo } from './users/repositories/usersRepository'
import UserRoutes from './users/routes'

export async function createApp(
    projectsRepository: IProjectsRepository,
    usersRepository: IUsersRepository,
): Promise<express.Application> {
    const app = express()

    app.use(bodyParser.json())

    console.log('setting up routes')
    ProjectRoutes(app, projectsRepository)
    UserRoutes(app, usersRepository)

    return app
}

export async function bootstrap(): Promise<void> {
    console.log('connecting to db')
    await mongoose.connect('mongodb://root:changeme@localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })

    const projectsRepository = new ProjectsRepositoryMongo()
    const usersRepository = new UsersRepositoryMongo()

    const app = await createApp(projectsRepository, usersRepository)

    console.log('starting server')
    app.listen(3000)
}
