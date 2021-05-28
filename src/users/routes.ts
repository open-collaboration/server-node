import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import express from 'express'
import { Logger } from '../logger'
import { handleAsync } from '../utils'
import LoginDto from './dtos/loginDto'
import RegisterUserDto from './dtos/registerUserDto'
import User from './models/user'
import { IUsersRepository } from './repositories/usersRepository'
import { ISessionsService } from './sessionsService'

async function registerUser(
    req: express.Request,
    res: express.Response,
    usersRepository: IUsersRepository,
) {
    const dto = plainToClass(RegisterUserDto, req.body)
    const validationErrors = await validate(dto)
    if (validationErrors.length > 0) {
        res.json(validationErrors)
        res.status(400)
        res.end()
        return
    }

    const user = new User()
    user.email = dto.email
    user.username = dto.username
    await user.setPassword(dto.password)

    if (await usersRepository.checkForConflict(user.username, user.email)) {
        // TODO: send error details to client
        res.status(409)
        res.end()
        return
    }

    await usersRepository.createUser(user)

    res.status(201)
    res.end()
}

async function login(
    req: express.Request,
    res: express.Response,
    usersRepository: IUsersRepository,
    sessionsService: ISessionsService,
) {
    const logger = Logger.create()
    const dto = plainToClass(LoginDto, req.body)

    const user = await usersRepository.getUserByUsername(dto.username)

    if (user === undefined) {
        logger.info('user not found', { dto })

        res.status(401)
        res.end()
        return
    }

    if (await user.comparePassword(dto.password)) {
        logger.info('user authenticated')

        const sessionToken = await sessionsService.createSession(user)

        res.cookie('session', sessionToken)
        res.status(200)
        res.end()
    } else {
        res.status(401)
        res.end()
    }
}

export default function setupRoutes(
    app: express.Express,
    usersRepository: IUsersRepository,
    sessionsService: ISessionsService,
): void {
    app.post('/register', handleAsync(registerUser, usersRepository))
    app.post('/login', handleAsync(login, usersRepository, sessionsService))
}
