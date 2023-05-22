'use strict'

import { Telegraf } from 'telegraf'
// import { message } from 'telegraf/filters'
import { get } from './utils.js'

const bot = new Telegraf(process.env.BOT_TOKEN)
const startReply = "I summarize things you don't want to read. " +
                   "Reply to a message with any of my commands. " +
                   "You can also ask me to summarize recent messages in the group chat."

bot.start(async (ctx) => {
  await ctx.reply(startReply)
})

bot.help(async (ctx) => {
  await ctx.reply(startReply)
})

bot.command('summarize', async (ctx) => {
  const replyToMessage = ctx.message.reply_to_message
  if (replyToMessage === undefined) {
    ctx.reply("Bruh you gotta reply to a message with that command. 🗿")
  } else {
    // TODO: schedule job on dashfeed
    const temp_contents_url = 'https://p02--dashfeed-backend-service--p9qpptgr79jf.code.run/contents/706249a6-45b3-4a30-b5c5-84644e5c73da'
    const contents = await get(temp_contents_url)
    const summary = contents.summary || "I can't read. 😳"
    await ctx.reply(summary, { reply_to_message_id: replyToMessage.message_id })
  }
  // TODO: summarize the last x number of messages
})

export default bot