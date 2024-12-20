import { Telegraf } from "telegraf"
import { config } from "dotenv";

config();

if (!process.env.TG_BOT_TOKEN) {
	throw new Error('Make sure you set TG_BOT_TOKEN in your .env file')
}

const telegramClient = new Telegraf(process.env.TG_BOT_TOKEN)

export default telegramClient;