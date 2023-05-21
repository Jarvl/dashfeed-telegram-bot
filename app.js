'use strict'

const { createServer } = require('http'),
      bot = require('./bot'),
      crypto = require('crypto')

const startServer = async () => {
  const port = process.env.PORT || 3000
  const webhookDomain = process.env.WEBHOOK_DOMAIN || process.env.NF_HOSTS

  createServer(await bot.createWebhook({
    domain: webhookDomain,
    secretToken: crypto.randomBytes(64).toString('hex'),
    allowed_updates: ['message']
  })).listen(port, () => {
    const domain = webhookDomain || `localhost:${port}`
    console.log(`Server running at ${domain}`)
  })
}

startServer()