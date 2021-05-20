import express from 'express'

type AsyncHandler = (req: express.Request, res: express.Response) => Promise<void>

// eslint-disable-next-line import/prefer-default-export
export function handleAsync(
    handler: AsyncHandler,
): express.Handler {
    return (req: express.Request, res: express.Response) => {
        handler(req, res)
            .catch((err) => {
                console.error(err)
                if (res.writable) {
                    res.status(499)
                    res.end()
                }
            })
    }
}
