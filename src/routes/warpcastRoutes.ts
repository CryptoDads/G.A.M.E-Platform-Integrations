import { Router, Request, Response, NextFunction } from 'express'
import { fetchChannel } from '../lib/fetchChannel'
import { botMessage } from '../lib/botMessage'
import { validateBearerToken } from '../lib/validate'
import { decode } from 'he'
import { config } from 'dotenv'
import { toInteger } from 'lodash'

config()

const router = Router()

const WARPCAST_CHANNEL = process.env.WARPCAST_CHANNEL
const FID = toInteger(process.env.FID)

if (!WARPCAST_CHANNEL) {
	throw new Error('Make sure you set WARPCAST_CHANNEL in your .env file')
}

if (!FID) {
	throw new Error('Make sure you set FID in your .env file')
}

// route to fetch and return the warpcast feed based on the provided channel and FID.
router.get('/feed', async (_req: Request, res: Response) => {
	try {
		const feed = await fetchChannel(WARPCAST_CHANNEL, FID)
		res.status(200).json({ feed })
	} catch (err) {
		console.error(`Error fetching warpcast feed: ${err}`)
	}
})

// route to post a new message to the warpcast channel, requiring authorization and valid message content.
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
			await botMessage(messageContent, WARPCAST_CHANNEL)
			res.status(200).json({
				success: true,
				message: 'Message posted successfully',
			})
		} catch (err: any) {
			next(err)
		}
	}
)

// Route to reply to a specific message in the warpcast channel, requiring authorization and valid content/hash.
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
			const hash = String(data?.hash || '')

			if (!messageContent || !hash) {
				res.status(400).json({
					error: 'Message content and ID are required',
				})
				return
			}
			await botMessage(messageContent, hash)
			res.status(200).json({
				success: true,
				message: 'Message posted successfully',
			})
		} catch (err: any) {
			next(err)
		}
	}
)

export default router
