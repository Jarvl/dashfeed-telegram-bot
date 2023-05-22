'use strict'

import 'dotenv/config'
import Fastify from 'fastify'
import Bot from './bot.js'
import Crypto from 'crypto'

const fastify = Fastify({ logger: true })

console.log("secret path component", Bot.secretPathComponent())

const webhook = await Bot.createWebhook({
  domain: process.env.WEBHOOK_DOMAIN || process.env.NF_HOSTS,
  secretToken: Crypto.randomBytes(64).toString('hex'),
  allowed_updates: ['message']
})

fastify.post(`/${Bot.secretPathComponent()}`, (req, rep) => webhook(req.raw, rep.raw));
fastify.get('/health', async () => ({ "succ": true }))

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
