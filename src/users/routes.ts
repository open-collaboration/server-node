import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import express from 'express'
import { asyncHandler } from '../utils'
import { RegisterUserDto } from './dtos'
import { User, UserModel } from './models'

export default function (app: express.Express): void {
    app.post('/register', asyncHandler(registerUser))
}

async function registerUser(req: express.Request, res: express.Response) {
    const dto = plainToClass(RegisterUserDto, req.body)
    const validationErrors = await validate(dto)
    if(validationErrors.length > 0) {
        res.json(validationErrors)
        res.status(400)
        res.end()
        return
    }

    const user = new User() 
    user.email = dto.email
    user.username = dto.username
    await user.setPassword(dto.password)

    await UserModel.create(user)

    res.status(201)
    res.end()
}
