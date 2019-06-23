import log from './log.js'

export default {
    todo: 'make meta endpoints for combining data from multiple endpoints',
    async mGetOwnActiveListingsFull(token) {
        if (!token) {
            log.e("Airbnbapi: Can't get an active listing list without a token")
            return null
        }
        const listings = await this.getOwnActiveListings({ token })
        const fullListings = await Promise.all(
            listings.map(listing => {
                return this.getListingInfoHost({ token, id: listing.id })
            })
        )
        return fullListings
    },
    async mGetAllOwnActiveListings(token) {
        if (!token) {
            log.e("Airbnbapi: Can't get an active listing list without a token")
            return null
        }
        var start = 0
        var limit = 25
        var listings = await this.getOwnActiveListings({ token, offset: start, limit: limit })
        while (listings.length == start + limit) {
            start += limit
            listings = listings.concat(
                await this.getOwnActiveListings({ token, offset: start, limit })
            )
        }
        return listings
    }
}
