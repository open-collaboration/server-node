import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { handleAsync } from '../utils'
import LoginDto from './dtos/loginDto'
import RegisterUserDto from './dtos/registerUserDto'
import { User, UserModel } from './models/user'

async function registerUser(req: express.Request, res: express.Response) {
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

    if (await UserModel.exists({ username: user.username })) {
        // TODO: send error details to client
        res.status(409)
        res.end()
        return
    }

    if (await UserModel.exists({ email: user.email })) {
        // TODO: send error details to client
        res.status(409)
        res.end()
        return
    }

    await UserModel.create(user)

    res.status(201)
    res.end()
}

async function login(req: express.Request, res: express.Response) {
    const dto = plainToClass(LoginDto, req.body)

    const user = await UserModel.findOne({
        username: dto.username,
    })

    if (user == null) {
        console.log('user not found', { dto })
        res.status(401)
        res.end()
        return
    }

    if (await user.comparePassword(dto.password)) {
        const sessionToken = uuidv4()
        // TODO: store cookie in redis

        res.cookie('session', sessionToken)
        res.status(200)
        res.end()
    } else {
        res.status(401)
        res.end()
    }
}

export default function setupRoutes(app: express.Express): void {
    app.post('/register', handleAsync(registerUser))
    app.post('/login', handleAsync(login))
}
