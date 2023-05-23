import 'dotenv/config'
import Middie from '@fastify/middie'
import fastify from './fastify.js'
import { registerUpdateHandlers, createWebhookMiddleware } from './bot'

// Run this in dev to ensure it doesn't blow up
registerUpdateHandlers()
fastify.get('/health', async () => ({ "succ": true }))

const startServer = async () => {
  if (process.env.NF_HOSTS !== undefined) {
    await fastify.register(Middie)
    fastify.use(await createWebhookMiddleware())
  } else {
    fastify.log.warn("Bypassing Telegram webhook creation")
  }

  const port = 3000
  try {
    await fastify.listen({ port: port, host: '0.0.0.0' }) // 0.0.0.0 is needed for docker/kube
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

startServer()
