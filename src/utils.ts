import { ClassConstructor, plainToClass } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import express from 'express'

type AsyncHandler<T extends unknown[]> =
    (req: express.Request, res: express.Response, ...injected: T) => Promise<void>

// eslint-disable-next-line import/prefer-default-export
export function handleAsync<T extends unknown[]>(
    handler: AsyncHandler<T>,
    ...injected: T
): express.Handler {
    return (req: express.Request, res: express.Response) => {
        handler(req, res, ...injected)
            .then(() => {
                console.log(res.statusCode)
            })
            .catch((err) => {
                console.error(err)
                if (res.writable) {
                    res.status(500)
                    res.end()
                }
            })
    }
}

interface ValidationErr {
    field: string,
    errors: Record<string, string>
}

function simplifyValidationErrors(errors: ValidationError[]): ValidationErr[] {
    return errors
        .filter((err) => err.constraints !== undefined)
        .map((err) => ({
            field: err.property,
            errors: err.constraints as Record<string, string>,
        }))
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function validateDto<T extends object>(
    class_: ClassConstructor<T>,
    data: Record<string, unknown>,
): Promise<[T, ValidationErr[]]> {
    const dto = plainToClass(class_, data)
    const errors = await validate(dto, { forbidNonWhitelisted: true })
    return [
        dto,
        simplifyValidationErrors(errors),
    ]
}
