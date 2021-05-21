import bodyParser from 'body-parser'
import express from 'express'
import mongoose from 'mongoose'
import { ProjectsRepository } from './projects/repositories/projectsRepository'
import ProjectRoutes from './projects/routes'
import { UsersRepository } from './users/repositories/usersRepository'
import UserRoutes from './users/routes'

const app = express()

async function bootstrap() {
    console.log('connecting to db')
    await mongoose.connect('mongodb://root:changeme@localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })

    app.use(bodyParser.json())

    const usersRepository = new UsersRepository()
    const projectsRepository = new ProjectsRepository()

    console.log('setting up routes')
    ProjectRoutes(app, projectsRepository)
    UserRoutes(app, usersRepository)

    console.log('starting server')
    app.listen(3000)
}

bootstrap()
