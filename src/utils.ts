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
                    res.status(499)
                    res.end()
                }
            })
    }
}
