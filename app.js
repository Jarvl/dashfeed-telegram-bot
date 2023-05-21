'use strict'

const { createServer } = require('http'),
      bot = require('./bot'),
      crypto = require('crypto')

const startServer = async () => {
  const port = process.env.PORT || 3000

  createServer(await bot.createWebhook({
    domain: 'example.com',
    secretToken: crypto.randomBytes(64).toString('hex')
  })).listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
  })
}

startServer()