'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    todo: 'make meta endpoints for combining data from multiple endpoints',
    async mGetOwnActiveListingsFull(token) {
        if (!token) {
            _log2.default.e("Airbnbapi: Can't get an active listing list without a token");
            return null;
        }
        const listings = await this.getOwnActiveListings(token);
        const fullListings = await Promise.all(listings.map(listing => {
            return this.getListingInfoHost({ token, id: listing.id });
        }));
        return fullListings;
    }
};