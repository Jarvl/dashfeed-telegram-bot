'use strict'

import { Telegraf } from 'telegraf'
// import { message } from 'telegraf/filters'

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
  const replyToMessage = ctx.message.reply_to_message
  if (replyToMessage === undefined) {
    ctx.reply("Bruh you gotta reply to a message with that command. 🗿")
  } else {
    // TODO: reply to a message containing a URL and summarize the content
    // TODO: schedule job on dashfeed
    const args = { reply_to_message_id: replyToMessage.message_id }
    ctx.reply("I ain't reading that shit. 🗿", args)
  }
  // TODO: summarize the last x number of messages
})

export default bot