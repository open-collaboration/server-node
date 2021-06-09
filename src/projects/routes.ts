import express from 'express'
import { Logger } from '../logger'
import { ISessionsService } from '../users/sessionsService'
import { handleAsync, validateDto } from '../utils'
import { PROJECT_DTO_GROUP_CREATE } from './dtos/dtoGroups'
import ProjectDto from './dtos/projectDto'
import ProjectSummaryDto from './dtos/projectSummaryDto'
import { IProjectsRepository } from './repositories/projectsRepository'
import { IProjectsService } from './services/projectsService'

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

    const projectSummaries = await projectsRepository.listProjects(offset, limit)

    res
        .status(200)
        .json(projectSummaries.map(ProjectSummaryDto.fromProject))
        .end()
}

async function getProject(
    req: express.Request,
    res: express.Response,
    projectsRepository: IProjectsRepository,
) {
    const projectId = req.params.id

    const project = await projectsRepository.getProjectById(projectId)
    if (project === undefined) {
        res.status(404)
        res.end()
        return
    }

    const dto = ProjectDto.fromProject(project)
    res
        .status(200)
        .json(dto)
        .end()
}

async function createProject(
    req: express.Request,
    res: express.Response,
    sessionsService: ISessionsService,
    projectsService: IProjectsService,
) {
    const logger = Logger.create()

    const [dto, validationErrors] = await validateDto(
        ProjectDto,
        req.body,
        [PROJECT_DTO_GROUP_CREATE],
    )
    if (validationErrors.length > 0) {
        logger.info('failed to validate dto', { validationErrors })

        res
            .status(400)
            .json(validationErrors)
            .end()
        return
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

    const projectId = await projectsService.createProject(dto, user)

    logger.info('successfully created project', { projectId })

    res.header('Location', `/projects/${projectId}`)
    res.status(201)
    res.end()
}

async function deleteProject(
    req: express.Request,
    res: express.Response,
    projectsRepository: IProjectsRepository,
    sessionsService: ISessionsService,
) {
    const projectId: string = req.params.id

    if (req.cookies.session === undefined) {
        res.status(401)
        res.end()
        return
    }

    const user = await sessionsService.getSession(req.cookies.session)
    if (user === undefined) {
        res.status(401)
        res.end()
        return
    }

    const project = await projectsRepository.getProjectById(projectId)
    if (project === undefined) {
        res.status(404)
        res.end()
        return
    }

    if (project.userId !== user.id) {
        res.status(401)
        res.end()
        return
    }

    if (project.id === undefined) {
        throw new Error('Project has no id')
    }

    await projectsRepository.deleteProjectById(project.id)

    res.status(204)
    res.end()
}

export default function setupRoutes(
    app: express.Express,
    projectsRepository: IProjectsRepository,
    sessionsService: ISessionsService,
    projectsService: IProjectsService,
): void {
    app.get('/projects', handleAsync(listProjects, projectsRepository))
    app.get('/projects/:id', handleAsync(getProject, projectsRepository))
    app.post('/projects', handleAsync(createProject, sessionsService, projectsService))
    app.delete('/projects/:id', handleAsync(deleteProject, projectsRepository, sessionsService))
}
