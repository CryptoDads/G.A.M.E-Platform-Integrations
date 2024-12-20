import neynarClient from './clients/neynarClient.js'

interface PublishCastPayload {
	signerUuid: string
	text: string
	parent?: string
}

// Sends a message (cast) to the specified channel, optionally linking it to a parent message.
export async function botMessage(
	message: string,
	parent: string | null = null
) {
	if (!process.env.SIGNER_UUID) {
		throw new Error('Make sure you set SIGNER_UUID in your .env file')
	}

	const payload: PublishCastPayload = {
		signerUuid: process.env.SIGNER_UUID,
		text: message,
	}

	if (parent) payload.parent = parent

	await neynarClient.publishCast(payload)
}
