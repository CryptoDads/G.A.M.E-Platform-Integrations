import { Request } from 'express'

// validates the bearer token from the request's authorization header.
export function validateBearerToken(req: Request): boolean {
	const authHeader = req.headers['authorization']
	if (!authHeader || !authHeader.startsWith('Bearer ')) return false
	const token = authHeader.substring('Bearer '.length)
	return token === process.env.BEARER_TOKEN
}
