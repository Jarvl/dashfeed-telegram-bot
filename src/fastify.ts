import 'dotenv/config'
import Fastify from 'fastify'
import { environment } from './utils.js'
import { PinoLoggerOptions } from 'fastify/types/logger'

interface EnvLoggerConfigs {
  development: PinoLoggerOptions,
  production: PinoLoggerOptions
}

const transportOpts = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname'
    }
  }
}

const developmentLogger: PinoLoggerOptions = {
  ...transportOpts
}

const productionLogger: PinoLoggerOptions = {
  level: 'warn',
  ...transportOpts
}

const envLoggerConfig: EnvLoggerConfigs = {
  development: developmentLogger,
  production: productionLogger
}

const fastify = Fastify({
  logger: envLoggerConfig[environment as keyof EnvLoggerConfigs]
})

export default fastify
