import { FeedType, FilterType } from '@neynar/nodejs-sdk/build/api/index.js'
import neynarClient from './clients/neynarClient.js'

// Fetches a feed based on the parent URL and fid, with a filter for members only.
export async function fetchChannel(
	parentUrl: string, fid: number
) {
	const feed = await neynarClient.fetchFeed({
		feedType: FeedType.Filter,
		filterType: FilterType.ParentUrl,
		parentUrl: parentUrl,
		membersOnly: true,
		fid: fid,
		limit: 30,
	})

	return feed
}
