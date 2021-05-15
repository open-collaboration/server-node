import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import express from 'express'
import { asyncHandler } from '../utils'
import { ProjectDto } from './dtos'
import { Project, ProjectModel } from './models'

export default function(app: express.Express): void {
    app.get('/projects', asyncHandler(listProjects))
    app.post('/projects', asyncHandler(createProject))
}

async function listProjects(req: express.Request, res: express.Response) {
    let offset = parseInt(req.query.offset as string)
    let limit = parseInt(req.query.limit as string)
    
    if(Number.isNaN(offset)) {
        offset = 0
    }

    if(Number.isNaN(limit)) {
        limit = 20
    }

    const projects = await ProjectModel.find().skip(offset).limit(limit).exec()

    res.json(projects.map(ProjectDto.fromProject))
    res.end()
}

async function createProject(req: express.Request, res: express.Response) {
    const payload = req.body

    const dto = plainToClass(ProjectDto, payload)

    console.log(dto)
    console.log(payload)

    const validationErrors = await validate(dto, { forbidNonWhitelisted: true })
    if (validationErrors.length > 0) {
        res.json(validationErrors)
        res.status(400)
        res.end()
        return
    }

    const model = new Project()
    model.title = dto.title
    model.shortDescription = dto.shortDescription
    model.longDescription = dto.longDescription

    await ProjectModel.create(model)

    res.status(201)
    res.end()
}

