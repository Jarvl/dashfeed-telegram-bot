'use strict'

const { Telegraf } = require('telegraf'),
      { message } = require('telegraf/filters')

const bot = new Telegraf(process.env.BOT_TOKEN)

const startReply = "I summarize things you don't want to read. " +
                   "Reply to a message with any of my commands. " +
                   "You can also ask me to summarize recent messages in the group chat."

bot.start((ctx) => {
  ctx.reply(startReply)
})

bot.help((ctx) => {
  ctx.reply(startReply)
})

bot.command('summarize', (ctx) => {
  // TODO: summarize the last x number of messages
  // TODO: reply to a message containing a URL and summarize the content
  ctx.reply("I ain't reading that shit. 🗿")
  // TODO: schedule job on dashfeed
})

module.exports = bot