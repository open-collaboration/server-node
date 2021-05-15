import bodyParser from 'body-parser'
import express from 'express'
import mongoose from 'mongoose'
import ProjectRoutes from './projects/routes'

const app = express()

async function bootstrap() {
    await mongoose.connect('mongodb://root:changeme@localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true})

    app.use(bodyParser.json())

    ProjectRoutes(app)

    app.listen(3000)
}


bootstrap()
