'use strict'

import 'dotenv/config'
import Fastify from 'fastify'
import Middie from '@fastify/middie'
import { registerUpdateHandlers, createWebhookMiddleware } from './bot.js'

const isDevelopment = ['1', 'true'].includes(process.env.DEVELOPMENT)

const fastify = Fastify({ logger: isDevelopment })
if (!isDevelopment) {
  await fastify.register(Middie)
  fastify.use(await createWebhookMiddleware())
}

// Run this in dev to ensure it doesn't blow up
registerUpdateHandlers()

fastify.get('/health', async () => ({ "succ": true }))

try {
  await fastify.listen({ port: 3000, host: '0.0.0.0' }) // 0.0.0.0 is needed for docker/kube
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
