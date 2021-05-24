import { NextFunction, Request, Response } from 'express'
import * as uuid from 'uuid'
import * as context from '../context'

export default function requestId(req: Request, res: Response, next: NextFunction): void {
    context.namespace.set(context.requestIdKey, uuid.v4())
    next()
}
