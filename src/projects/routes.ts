import express from 'express'
import { Logger } from '../logger'
import { ISessionsService } from '../users/sessionsService'
import { handleAsync, validateDto } from '../utils'
import ProjectDto from './dtos/projectDto'
import ProjectSummaryDto from './dtos/projectSummaryDto'
import Project from './models/project'
import Role from './models/role'
import { IProjectsRepository } from './repositories/projectsRepository'
import { IRolesRepository } from './repositories/rolesRepository'

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

    res.json(projectSummaries.map(ProjectSummaryDto.fromProject))
    res.end()
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
    res.status(200)
    res.json(dto)
    res.end()
}

async function createProject(
    req: express.Request,
    res: express.Response,
    projectsRepository: IProjectsRepository,
    sessionsService: ISessionsService,
    rolesRepository: IRolesRepository,
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

    // Check if user already owns a project.
    // Each user can only own a single project.
    const existingProject = await projectsRepository.getProjectByUserId(user.id)
    if (existingProject !== undefined) {
        logger.info('User already owns a project')

        // TODO: send proper error message
        res.status(409)
        res.end()
        return
    }

    // Check if roles dont have an id (as we cannot create a role that already exists)
    if (!dto.roles.every((x) => x.id === undefined)) {
        logger.info('One or more roles already have IDs')

        res.status(400)
        res.end()
        return
    }

    const model = new Project()
    model.title = dto.title
    model.shortDescription = dto.shortDescription
    model.longDescription = dto.longDescription
    model.userId = user.id

    const projectId = await projectsRepository.createProject(model)

    const roleModels = dto.roles.map((x) => {
        const role = new Role()

        role.projectId = projectId
        role.title = x.title
        role.skills = x.skills
        role.description = x.description

        return role
    })

    await rolesRepository.createRoles(roleModels)

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
    rolesRepository: IRolesRepository,
): void {
    app.get('/projects', handleAsync(listProjects, projectsRepository))
    app.get('/projects/:id', handleAsync(getProject, projectsRepository))
    app.post('/projects', handleAsync(createProject, projectsRepository, sessionsService, rolesRepository))
    app.delete('/projects/:id', handleAsync(deleteProject, projectsRepository, sessionsService))
}
