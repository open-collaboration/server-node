import { ValidationError } from 'class-validator'

export default class DtoValidationError extends Error {
    constructor(
        public readonly errors: ValidationError[],
    ) {
        super()
    }
}
