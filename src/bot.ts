import 'dotenv/config'
import Crypto from 'crypto'
import * as linkify from 'linkifyjs'
import { Telegraf, Context, Markup } from 'telegraf'
import { callbackQuery } from 'telegraf/filters'
import { Message } from 'telegraf/typings/core/types/typegram'
import {
  lineBreakRegex,
  setBackoffInterval,
  Content,
  createContent,
  getContent,
  submitContentVote
} from './utils'
import fastify from './fastify.js'

if (process.env.BOT_TOKEN === undefined) {
  console.log('define BOT_TOKEN in env')
  process.exit(1)
}

const upvote = 'upvote'
const downvote = 'downvote'
const voteDelimiter = '------'

const bot = new Telegraf(process.env.BOT_TOKEN)
const botDescription =
  "I summarize things you don't want to read. " +
  "Reply to a message with /summary and I'll send a DashFeed-powered summary of the message " +
  "or the linked content in the message."

const replyWithBotDescription = async (ctx: Context) => {
  await ctx.reply(botDescription)
}

const handleSummarizeCommand = async (ctx: Context) => {
  const repliedToMessage = (ctx.message as Message.TextMessage).reply_to_message as Message.TextMessage | undefined

  if (!repliedToMessage) {
    await ctx.reply("Bruh you gotta reply to a message with that command. 🗿")
  } else if (!repliedToMessage?.text) {
    await ctx.reply("Bruh you gotta reply to a text-only message with that command. 🗿")
  } else {
    const repliedToMessageText = repliedToMessage.text.trim()
    const urls = linkify.find(repliedToMessageText, 'url').map(link => link.href)
    const isUrl = urls.length > 0
    fastify.log.info(`urls: ${JSON.stringify(urls)}, messageText: ${repliedToMessageText}`)

    // TODO: handle multiple URLs
    const replyArgs = { reply_to_message_id: repliedToMessage.message_id }
    // TODO: passing empty text to bypass input validation
    const contentBody = isUrl ? { text: '', url: urls[0] } : { text: repliedToMessageText }
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
    const inProgressMessage = await ctx.reply(replyText, replyArgs)
    replyWithContentSummary(ctx, repliedToMessage.message_id, createContentRes.id, inProgressMessage.message_id)
  }
}

const replyWithContentSummary = async (ctx: Context, replyToMessageId: Message['message_id'], contentId: Content['id'], inProgressMessageId: Message['message_id']) => {
  const finalReply = async (text: string, id?: string) => {
    const deleteMessage = ctx.deleteMessage(inProgressMessageId)
    const inlineKeyboard = id
      ? Markup.inlineKeyboard([
          Markup.button.callback('👍', `${id}_${upvote}`),
          Markup.button.callback('👎', `${id}_${downvote}`)
        ])
      : {}
    const reply = ctx.reply(text, {
      // parse_mode: 'MarkdownV2',
      reply_to_message_id: replyToMessageId, ...inlineKeyboard
    })
    await deleteMessage, reply
    fastify.log.info(`Reply sent message_id=${(await reply).message_id}`)
  }

  try {
    await setBackoffInterval(async (done) => {
      const controller = new AbortController()
      const { signal } = controller
      setTimeout(() => controller.abort(), 5000)

      const content = await getContent(contentId, signal)
      fastify.log.info(`content: ${JSON.stringify(content)}, contentId: ${contentId}`)
      if (content.summary) {
        done()
        await finalReply(content.summary, content.id)
      }
    })
  } catch {
    await finalReply("Wow thats a lotta words too bad I'm not readin em. 🗿")
  }
}

const buildVotesMarkdown = async (messageText: string) => {
  if (messageText.includes(voteDelimiter)) {
    const [originalMessageText, votesText] = messageText.split(voteDelimiter)
    if (votesText) {
      
    }
  } else {

  }
}

const registerUpdateHandlers = () => {
  bot.start(replyWithBotDescription)
  bot.help(replyWithBotDescription)
  bot.command('summary', handleSummarizeCommand)
  bot.on(callbackQuery('data'), async (ctx) => {
    const [contentId, vote] = ctx.callbackQuery.data.split('_')
    if (['downvote', 'upvote'].includes(vote)) {
      fastify.log.info(`Vote submitted callback_query_data=${ctx.callbackQuery.data}`)
      await submitContentVote(contentId, vote)
      await ctx.answerCbQuery('Feedback submitted')
    } else {
      fastify.log.warn(`Improper vote callback_query_data=${ctx.callbackQuery.data}`)
    }
  })
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
    allowed_updates: ['message', 'callback_query']
  })
}

export { registerUpdateHandlers, createWebhookMiddleware }