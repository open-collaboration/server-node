import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import express from 'express'
import { handleAsync } from '../utils'
import ProjectDto from './dtos/projectDto'
import { Project } from './models/project'
import { ProjectsRepository } from './repositories/projectsRepository'

async function listProjects(
    req: express.Request,
    res: express.Response,
    projectsRepository: ProjectsRepository,
) {
    let offset = parseInt(req.query.offset as string)
    let limit = parseInt(req.query.limit as string)

    if (Number.isNaN(offset)) {
        offset = 0
    }

    if (Number.isNaN(limit)) {
        limit = 20
    }

    const projects = await projectsRepository.listProjects(offset, limit)

    res.json(projects.map(ProjectDto.fromProject))
    res.end()
}

async function createProject(
    req: express.Request,
    res: express.Response,
    projectsRepository: ProjectsRepository,
) {
    const dto = plainToClass(ProjectDto, req.body)

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

    await projectsRepository.createProject(model)

    res.status(201)
    res.end()
}

export default function setupRoutes(
    app: express.Express,
    projectsRepository: ProjectsRepository,
): void {
    app.get('/projects', handleAsync(listProjects, projectsRepository))
    app.post('/projects', handleAsync(createProject, projectsRepository))
}
