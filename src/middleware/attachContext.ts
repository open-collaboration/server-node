import { NextFunction, Request, Response } from 'express'
import * as context from '../context'

export default function attachContext(req: Request, res: Response, next: NextFunction): void {
    context.namespace.run(() => next())
}
