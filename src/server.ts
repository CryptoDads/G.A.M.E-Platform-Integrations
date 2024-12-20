import express, { Request, Response, NextFunction } from 'express'
import discordClient from './lib/clients/discordClient'
import { config } from 'dotenv'
import discordRoutes from './routes/discordRoutes'
import telegramClient from './lib/clients/telegramClient'
import telegramRoutes from './routes/telegramRoutes'
import warpcastRoutes from './routes/warpcastRoutes'

config()

if (!process.env.DISCORD_BOT_TOKEN) {
	throw new Error('Make sure you set DISCORD_BOT_TOKEN in your .env file')
}

if (!process.env.BEARER_TOKEN) {
	throw new Error('Make sure you set BEARER_TOKEN in your .env file')
}

if (!process.env.TRUST_PROXY) {
	throw new Error('Make sure you set TRUST_PROXY in your .env file')
}

// Initializes and runs the Discord bot client
function runDiscordBot() {
	discordClient
		.login(process.env.DISCORD_BOT_TOKEN)
		.catch((err) => console.error(`Error running Discord bot: ${err}`))
}

// Initializes and runs the Telegram bot client
async function runTelegramBot() {
	try {
		await telegramClient.launch()
	} catch (err) {
		console.error(`Error running Telegram bot: ${err}`)
	}
}

const app = express()
app.use(express.json())

// Set up API routes for different services
app.use('/dc', discordRoutes)
app.use('/tg', telegramRoutes)
app.use('/wc', warpcastRoutes)

// Centralized error handling to ensure any unhandled errors are logged and returned as JSON
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack)
	res.status(500).json({
		error: 'Something went wrong!',
		message: err.message,
	})
})

// Graceful shutdown for clean bot termination
process.on('SIGINT', () => {
	console.log('Shutting down gracefully...')
	telegramClient.stop()
	console.log('Telegram bot stopped.')
	process.exit(0)
})

process.on('SIGTERM', () => {
	console.log('Shutting down gracefully...')
	telegramClient.stop()
	console.log('Telegram bot stopped.')
	process.exit(0)
})

// Main function to coordinate starting all services (Express server, Discord bot, Telegram bot)
;(async function main() {
	try {
		const telegramBotPromise = runTelegramBot()
		const discordBotPromise = runDiscordBot()

		const PORT = process.env.PORT
		const expressServerPromise = new Promise<void>((resolve) => {
			app.listen(PORT, () => {
				console.log(`Express server running on port ${PORT}`)
				resolve()
			})
		})

		await Promise.all([
			telegramBotPromise,
			discordBotPromise,
			expressServerPromise,
		])
	} catch (err) {
		console.error('Error starting services:', err)
		process.exit(1)
	}
})()
