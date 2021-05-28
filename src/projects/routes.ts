import express from 'express'
import { Logger } from '../logger'
import { ISessionsService } from '../users/sessionsService'
import { handleAsync, validateDto } from '../utils'
import ProjectDto from './dtos/projectDto'
import Project from './models/project'
import { IProjectsRepository } from './repositories/projectsRepository'

async function listProjects(
    req: express.Request,
    res: express.Response,
    projectsRepository: IProjectsRepository,
) {
    let offset = parseInt(req.query.offset as string)
    let limit = parseInt(req.query.limit as string)

    if (Number.isNaN(offset) || offset < 0) {
        offset = 0
    }

    if (Number.isNaN(limit) || limit <= 0) {
        limit = 20
    }

    const projects = await projectsRepository.listProjects(offset, limit)

    res.json(projects.map(ProjectDto.fromProject))
    res.end()
}

async function createProject(
    req: express.Request,
    res: express.Response,
    projectsRepository: IProjectsRepository,
    sessionsService: ISessionsService,
) {
    const logger = Logger.create()

    const [dto, validationErrors] = await validateDto(ProjectDto, req.body)
    if (validationErrors.length > 0) {
        logger.info('failed to validate dto', { validationErrors })

        res.json(validationErrors)
        res.status(400)
        res.end()
        return
    }

    if (dto.id !== undefined) {
        logger.info('cannot create project with an id')

        // TODO: send proper error message
        res.status(400)
        res.end()
    }

    let sessionToken: string | undefined
    if (typeof req.cookies.session === 'string') {
        sessionToken = req.cookies.session
    }

    if (sessionToken === undefined) {
        logger.info('Session token not set')

        // TODO: send proper error message
        res.status(401)
        res.end()
        return
    }

    const user = await sessionsService.getSession(sessionToken)
    if (user === undefined) {
        logger.info('Invalid session')

        // TODO: send proper error message
        res.status(401)
        res.end()
        return
    }

    if (user.id === undefined) {
        throw new Error('User does not have id')
    }

    const model = new Project()
    model.title = dto.title
    model.shortDescription = dto.shortDescription
    model.longDescription = dto.longDescription
    model.userId = user.id

    const projectId = await projectsRepository.createProject(model)

    logger.info('successfully created project', { projectId })

    res.header('Location', `/projects/${projectId}`)
    res.status(201)
    res.end()
}

export default function setupRoutes(
    app: express.Express,
    projectsRepository: IProjectsRepository,
    sessionsService: ISessionsService,
): void {
    app.get('/projects', handleAsync(listProjects, projectsRepository))
    app.post('/projects', handleAsync(createProject, projectsRepository, sessionsService))
}
