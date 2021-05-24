/* eslint-disable max-classes-per-file */
import pino from 'pino'
import * as context from './context'

export abstract class Logger {
    abstract debug(msg: string, data?: Record<string, unknown>): void

    abstract info(msg: string, data?: Record<string, unknown>): void

    abstract warn(msg: string, data?: Record<string, unknown>): void

    abstract error(msg: string, data?: Record<string, unknown>): void

    static create(): Logger {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new PinoLogger()
    }
}

const pinoLoggerContextKey = 'logger_pino'

export class PinoLogger extends Logger {
    getRequestId(): string | undefined {
        const reqId = context.namespace.get(context.requestIdKey)
        if (typeof reqId === 'string') {
            return reqId
        }

        return undefined
    }

    getLogger(): pino.Logger {
        return pino({
            base: {
                requestId: this.getRequestId(),
            },
        })
    }

    context(data: Record<string, unknown>): void {
        context.namespace.set(pinoLoggerContextKey, this.getLogger().child(data))
    }

    debug(msg: string, data?: Record<string, unknown>): void {
        this.getLogger().debug(data || {}, msg)
    }

    info(msg: string, data?: Record<string, unknown>): void {
        this.getLogger().info(data || {}, msg)
    }

    warn(msg: string, data?: Record<string, unknown>): void {
        this.getLogger().warn(data || {}, msg)
    }

    error(msg: string, data?: Record<string, unknown>): void {
        this.getLogger().error(data || {}, msg)
    }
}
