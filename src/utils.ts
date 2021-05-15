import express from 'express'

export function asyncHandler(handler: (req: express.Request, res: express.Response) => Promise<void>): (req: express.Request, res: express.Response) => void {
    return (req: express.Request, res: express.Response) => {
        handler(req, res)
            .catch(err => {
                console.error(err)
                if (res.writable) {
                    res.status(499)
                    res.end()
                }
            })
    }
}