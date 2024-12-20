import { NextFunction, Router, Request, Response } from 'express'
import telegramClient from '../lib/clients/telegramClient'
import { validateBearerToken } from '../lib/validate'
import { Context } from 'telegraf'
import { Message } from '@telegraf/types'
import { decode } from 'he'
import { config } from 'dotenv'
import { toInteger } from 'lodash'

config()

const router = Router()

const telegram_chat_id = toInteger(process.env.TELEGRAM_CHAT_ID)

if (!telegram_chat_id) {
	throw new Error('Make sure you set TELEGRAM_CHAT_ID in your .env file')
}

// Store the last 100 Telegram messages in memory, keeping track of message metadata like ID, author, content, and timestamp.
const telegram_messages: {
	message_id: number
	author: string
	content: string
	timestamp: string
}[] = []

// handle incoming text messages from Telegram, filtering by chat ID and storing relevant data.
telegramClient.on('text', (ctx: Context) => {
	try {
		const message = ctx.message as Message.TextMessage

		if (!message || ctx.chat?.id !== telegram_chat_id) return

		const message_id = message.message_id
		const author = message.from?.username || 'Unknown'
		const content = message.text || ''
		const timestamp = new Date(message.date * 1000).toISOString()

		telegram_messages.push({ message_id, author, content, timestamp })
		while (telegram_messages.length > 100) {
			telegram_messages.shift()
		}
	} catch (err) {
		console.error(`Error handling Telegram message: ${err}`)
	}
})

// Route to get the last 60 messages from Telegram, formatted and ready for response.
router.get('/last_messages', (_req: Request, res: Response) => {
	const recentMessages = [...telegram_messages].slice(-60).reverse()

	const formatted = recentMessages.map((msg) => ({
		id: msg.message_id,
		author: msg.author,
		content: msg.content,
		timestamp: msg.timestamp,
	}))

	res.status(200).json({ messages: formatted })
})

// Helper function to send a message to Telegram, with optional reply functionality.
async function sendTelegramMessage(messageContent: string, replyId?: number) {
	try {
		const options = {
			reply_to_message_id: replyId,
		} as Record<string, any>

		if (replyId) {
			await telegramClient.telegram.sendMessage(
				telegram_chat_id,
				messageContent,
				options
			)
		} else {
			await telegramClient.telegram.sendMessage(
				telegram_chat_id,
				messageContent
			)
		}

		return { success: true, message: 'Message posted to Telegram' }
	} catch (err: any) {
		return { success: false, error: String(err) }
	}
}

// Route to post a message to Telegram, requiring authorization and message validation.
router.post(
	'/post_message',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!validateBearerToken(req)) {
				res.status(401).json({ error: 'Unauthorized' })
				return
			}

			const data = req.body
			const messageContent = decode(data?.message || '')

			if (!messageContent) {
				res.status(400).json({ error: 'Message content is required' })
				return
			}

			const result = await sendTelegramMessage(messageContent)

			res.status(result.success ? 200 : 500).json(result)
		} catch (err: any) {
			next(err)
		}
	}
)

// Route to reply to a specific message in Telegram, requiring authorization and valid message ID.
router.post(
	'/reply_message',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!validateBearerToken(req)) {
				res.status(401).json({ error: 'Unauthorized' })
				return
			}

			const data = req.body
			const messageContent = decode(data?.message || '')
			const messageId = parseInt(data?.id, 10)

			if (!messageContent || isNaN(messageId)) {
				res.status(400).json({
					error: 'Message content and a valid ID are required',
				})
				return
			}

			const result = await sendTelegramMessage(messageContent, messageId)

			res.status(result.success ? 200 : 500).json(result)
		} catch (err: any) {
			next(err)
		}
	}
)

export default router
