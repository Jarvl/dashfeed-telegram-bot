import 'dotenv/config'
import Crypto from 'crypto'
import { Message } from 'typegram'
import { Telegraf, Context } from 'telegraf'
import { isValidUrl, Content, createContent, getContent } from './utils'
import fastify from './fastify.js'

if (process.env.BOT_TOKEN === undefined) {
  console.log('define BOT_TOKEN in env')
  process.exit(1)
}

const bot = new Telegraf(process.env.BOT_TOKEN)
const botDescription =
  "I summarize things you don't want to read. " +
  "Reply to a message with any of my commands. " +
  "You can also ask me to summarize recent messages in the group chat."

const replyWithBotDescription = async (ctx: Context) => {
  await ctx.reply(botDescription)
}

const handleSummarizeCommand = async (ctx: Context) => {
  const repliedToMessage = (ctx.message as Message.TextMessage).reply_to_message as Message.TextMessage
  const repliedToMessageText = repliedToMessage.text.trim()

  if (repliedToMessage === undefined) {
    await ctx.reply("Bruh you gotta reply to a message with that command. 🗿")
  } else {
    const replyArgs = { reply_to_message_id: repliedToMessage.message_id }
    const isUrl = isValidUrl(repliedToMessageText)
    fastify.log.info(`isUrl: ${isUrl}, messageText: ${repliedToMessageText}`)
    // TODO: passing empty text to bypass input validation
    const contentBody = isUrl ? { text: '', url: repliedToMessageText } : { text: repliedToMessageText }
    let createContentRes: Content

    try {
      createContentRes = await createContent(contentBody)
      fastify.log.info(`createContentRes: ${JSON.stringify(createContentRes)}`)
      if (!createContentRes.id) {
        throw new Error("No content ID")
      }
    } catch(e) {
      await ctx.reply("I can't read. 😳", replyArgs)
      return
    }

    const replyText = `Summarizing ${isUrl ? 'URL content' : 'text'}, please wait...`
    await ctx.reply(replyText, replyArgs)
    replyWithContentSummary(ctx, repliedToMessage.message_id, createContentRes.id)
  }
}

const replyWithContentSummary = async (ctx: Context, replyToMessageId: Message['message_id'], contentId: Content['id']) => {
  const replyArgs = { reply_to_message_id: replyToMessageId }

  let retryCount = 0
  const interval = setInterval(() => {
    fastify.log.info(`retryCount: ${retryCount}, contentId: ${contentId}`)

    if (retryCount > 30) {
      ctx.reply("Wow thats a lotta words too bad I'm not readin em.", replyArgs)
      clearInterval(interval)
    }

    const controller = new AbortController()
    const { signal } = controller

    getContent(contentId, signal).then(content => {
      fastify.log.info(`content: ${JSON.stringify(content)}, contentId: ${contentId}`)
      if (content.summary) {
        ctx.reply(content.summary, replyArgs)
        clearInterval(interval)
      }
    })
    setTimeout(() => controller.abort(), 1999)
    retryCount++
  }, 2000);
}

const registerUpdateHandlers = () => {
  bot.start(replyWithBotDescription)
  bot.help(replyWithBotDescription)
  bot.command('summarize', handleSummarizeCommand)
}

const createWebhookMiddleware = async () => {
  const webhookUrl = process.env.NF_HOSTS
  if (webhookUrl === undefined) {
    console.log('define WEBHOOK_URL in env')
    process.exit(1)
  }

  return await bot.createWebhook({
    domain: webhookUrl,
    secret_token: Crypto.randomBytes(64).toString('hex'),
    allowed_updates: ['message']
  })
}

export { registerUpdateHandlers, createWebhookMiddleware }