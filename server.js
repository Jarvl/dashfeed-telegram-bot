'use strict'

import 'dotenv/config'
import Fastify from 'fastify'
import Middie from '@fastify/middie'
import { envLoggerConfig } from './utils.js'
import { registerUpdateHandlers, createWebhookMiddleware } from './bot.js'

const environment = process.env.ENV || 'production'
const fastify = Fastify({
  logger: envLoggerConfig[environment]
})

if (environment == 'production') {
  await fastify.register(Middie)
  fastify.use(await createWebhookMiddleware())
} else {
  fastify.log.warn("Bypassing Telegram webhook creation")
}

// Run this in dev to ensure it doesn't blow up
registerUpdateHandlers()
fastify.get('/health', async () => ({ "succ": true }))

const port = 3000
try {
  await fastify.listen({ port: port, host: '0.0.0.0' }) // 0.0.0.0 is needed for docker/kube
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
