import { Router, Request, Response, NextFunction } from 'express'
import { TextChannel } from 'discord.js'
import discordClient from '../lib/clients/discordClient'
import { validateBearerToken } from '../lib/validate'
import { decode } from 'he'
import { config } from 'dotenv'

config()

const router = Router()

const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID

if (!DISCORD_CHANNEL_ID) {
	throw new Error('Make sure you set DISCORD_CHANNEL_ID in your .env file')
}

// Route to fetch the last 60 messages from a specified Discord channel
// It also processes mentions to replace user IDs with readable usernames and handles reply mentions.
router.get(
	'/last_messages',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!discordClient.isReady()) {
				res.status(503).json({ error: 'Discord Bot is not ready' })
				return
			}

			const channel =
				discordClient.channels.cache.get(DISCORD_CHANNEL_ID)
			if (!channel || channel.type !== 0) {
				res.status(404).json({ error: 'Discord channel not found' })
				return
			}

			const textChannel = channel as TextChannel

			const fetchedMessages = await textChannel.messages.fetch({
				limit: 60,
			})

			const messages = Array.from(fetchedMessages.values()).map(
				(msg) => {
					let content = msg.content
					for (const user of msg.mentions.users.values()) {
						const mentionPlaceholder = `<@${user.id}>`
						const mentionPlaceholderNickname = `<@!${user.id}>`
						content = content.replace(
							mentionPlaceholder,
							`@${user.username}`
						)
						content = content.replace(
							mentionPlaceholderNickname,
							`@${user.username}`
						)
					}

					if (msg.reference?.messageId) {
						const repliedMessage = fetchedMessages.get(
							msg.reference.messageId
						)
						if (repliedMessage) {
							content = `@${repliedMessage.author.username} ${content}`
						}
					}

					return {
						id: msg.id,
						author: msg.author.username,
						content,
						timestamp: msg.createdAt.toISOString(),
					}
				}
			)

			res.status(200).json({ messages })
		} catch (err) {
			next(err)
		}
	}
)

// Route to post a new message to the specified Discord channel, requiring authorization and valid message content.
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

			if (!discordClient.isReady()) {
				res.status(503).json({ error: 'Discord Bot is not ready' })
				return
			}

			const channel =
				discordClient.channels.cache.get(DISCORD_CHANNEL_ID)
			if (!channel || channel.type !== 0) {
				res.status(404).json({ error: 'Discord channel not found' })
				return
			}
			const textChannel = channel as TextChannel

			await textChannel.send(messageContent)
			res.status(200).json({
				success: true,
				message: 'Message posted successfully',
			})
		} catch (err: any) {
			next(err)
		}
	}
)

// Route to reply to a specific message in the Discord channel, requiring authorization and valid message ID
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
			const messageId = String(data?.id || '')

			if (!messageContent || !messageId) {
				res.status(400).json({
					error: 'Message content and ID are required',
				})
				return
			}

			if (!discordClient.isReady()) {
				res.status(503).json({ error: 'Discord Bot is not ready' })
				return
			}

			const channel =
				discordClient.channels.cache.get(DISCORD_CHANNEL_ID)
			if (!channel || channel.type !== 0) {
				res.status(404).json({ error: 'Discord channel not found' })
				return
			}

			const textChannel = channel as TextChannel

			const originalMessage = await textChannel.messages.fetch(messageId)
			await originalMessage.reply(messageContent)

			res.status(200).json({
				success: true,
				message: 'Reply posted successfully',
			})
		} catch (err: any) {
			if (err.code === 10008) {
				res.status(404).json({ error: 'Message ID not found' })
				return
			}
			next(err)
		}
	}
)

export default router
