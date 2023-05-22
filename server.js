'use strict'

import 'dotenv/config'
import Fastify from 'fastify'
import Middie from '@fastify/middie'
import Bot from './bot.js'
import Crypto from 'crypto'

const fastify = Fastify({ logger: false })
await fastify.register(Middie)

fastify.use(await Bot.createWebhook({
  domain: process.env.WEBHOOK_DOMAIN || process.env.NF_HOSTS,
  secretToken: Crypto.randomBytes(64).toString('hex'),
  allowed_updates: ['message']
}))

fastify.get('/health', async () => ({ "succ": true }))

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' }) // 0.0.0.0 is needed for docker/kube
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
