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

function getErrors(validationError: ValidationError, parent = ''): ValidationErr[] {
    const errors: ValidationErr[] = []

    let fieldPath = `${validationError.property}`
    if (parent !== '') {
        fieldPath = `${parent}.${validationError.property}`
    } else {
        fieldPath = `${validationError.property}`
    }

    if (validationError.constraints !== undefined) {
        errors.push({
            field: fieldPath,
            errors: validationError.constraints,
        })
    }

    const childErrors = validationError
        .children?.map((x) => getErrors(x, fieldPath))
        // Join sub-arrays (map returns a 2d array, reduce transforms that into a 1d array)
        .reduce((acc, x) => [...acc, ...x], [])

    if (childErrors !== undefined) {
        errors.push(...childErrors)
    }

    return errors
}

function simplifyValidationErrors(errors: ValidationError[]): ValidationErr[] {
    return errors
        .map((x) => getErrors(x, ''))
        // Join sub-arrays (map returns a 2d array, reduce transforms that into a 1d array)
        .reduce((acc, x) => [...acc, ...x], [])
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function validateDto<T extends object>(
    class_: ClassConstructor<T>,
    data: Record<string, unknown>,
    groups: string[] | undefined = undefined,
): Promise<[T, ValidationErr[]]> {
    const dto = plainToClass(class_, data)
    const errors = await validate(dto, {
        forbidNonWhitelisted: true,
        groups,
        always: true,
        strictGroups: true,
    })
    return [
        dto,
        simplifyValidationErrors(errors),
    ]
}
