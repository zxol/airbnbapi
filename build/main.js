'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

var _metapoints = require('./metapoints.js');

var _metapoints2 = _interopRequireDefault(_metapoints);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AirApi {
    constructor() {
        Object.assign(this, _metapoints2.default);
        this.config = Object.assign({}, _config2.default);
    }

    // buildOptions() is a factory function to build HTML request data.
    // It's used to set config data and common defaults that can be overwritten.
    // It makes endpoints less verbose.
    buildOptions({
        token,
        method = 'GET',
        route = '/v2/batch',
        uri,
        json = true,
        headers,
        currency = this.config.currency,
        format,
        qs,
        body,
        timeout,
        proxy
    }) {
        const out = {
            method,
            uri: uri || this.config.domain + route,
            json,
            headers: _extends({}, this.config.default_headers, {
                'X-Airbnb-OAuth-Token': token === 'public' ? '' : this.config.token || token
            }, headers),
            qs: _extends({
                key: this.config.api_key,
                currency,
                _format: format
            }, qs),
            body,
            timeout,
            proxy: this.config.proxy
        };
        return out;
    }

    //////////// CONFIG SECTION ////////////
    //////////// CONFIG SECTION ////////////
    //////////// CONFIG SECTION ////////////

    setConfig({ defaultToken, apiKey, currency, userAgent, proxy }) {
        defaultToken && (this.config.token = defaultToken);
        apiKey && (this.config.api_key = apiKey);
        currency && (this.config.currency = currency);
        userAgent && (this.config.default_headers['User-Agent'] = userAgent);
        proxy && (this.config.proxy = proxy);
    }

    setDefaultToken(token) {
        if (token) {
            this.config.token = token;
        } else {
            this.config.token = undefined;
        }
    }

    setApiKey(key) {
        this.config.api_key = key;
    }

    setCurrency(currencyString) {
        this.config.currency = currencyString;
    }

    setUserAgent(userAgentString) {
        this.config.default_headers['User-Agent'] = userAgentString;
    }

    setProxy(proxyURL) {
        this.config.proxy = proxyURL;
    }

    //////////// AUTH SECTION ////////////
    //////////// AUTH SECTION ////////////
    //////////// AUTH SECTION ////////////

    // Ping server to see if the token is good.
    async testAuth(token) {
        if (!(token || this.config.token)) {
            _log2.default.i('Airbnbapi: No token included for testAuth() call');
            return null;
        } else {
            const options = this.buildOptions({
                method: 'POST',
                token,
                body: { operations: [] }
            });
            let response = await (0, _requestPromise2.default)(options).catch(e => {});
            return response ? true : false;
        }
    }

    // Grab a new auth token using a 'username and password' login method.
    async newAccessToken({ username, password } = {}) {
        if (!username) {
            _log2.default.e("Airbnbapi: Can't apply for a token without a username.");
            return null;
        } else if (!password) {
            _log2.default.e("Airbnbapi: Can't apply for a token without a password.");
            return null;
        }
        const options = this.buildOptions({
            token: 'public',
            method: 'POST',
            route: '/v1/authorize',
            body: {
                grant_type: 'password',
                username,
                password
            }
        });

        try {
            const response = await (0, _requestPromise2.default)(options);
            if (response && response.access_token) {
                _log2.default.i(`Airbnbapi: Successful login for [${username}], auth ID is [${response.access_token}]`);
                return { token: response.access_token };
            } else {
                _log2.default.e('Airbnbapi: no response from server when fetching token');
                return null;
            }
        } catch (e) {
            // if(e.response.access_token) {
            //     log.i('Airbnbapi: Successful login for [ ' + username + ' ], auth ID is [ ' + e.response.access_token + ' ]')
            //     return { token: e.response.access_token }
            // }
            // log.i(JSON.stringify(e, null, 4))
            _log2.default.e("Airbnbapi: Couldn't get auth token for " + username);
            _log2.default.e(e.error);
            return { error: e.error };
        }
    }

    async login({ email, password } = {}) {
        if (!email) {
            _log2.default.e("Airbnbapi: Can't login without an email.");
            return null;
        } else if (!password) {
            _log2.default.e("Airbnbapi: Can't apply for a token without a password.");
            return null;
        }
        const options = this.buildOptions({
            token: 'public',
            method: 'POST',
            route: '/v2/logins',
            body: {
                email,
                password
            }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            if (response && response.login) {
                _log2.default.i(`Airbnbapi: Successful login for [${email}], auth ID is [${response.login.id}]`);
                return response;
            } else {
                _log2.default.e('Airbnbapi: no response from server when fetching token');
                return null;
            }
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get auth token for " + email);
            _log2.default.e(e.error);
            return { error: e.error };
        }
    }

    //////////// CALENDAR SECTION ////////////
    //////////// CALENDAR SECTION ////////////
    //////////// CALENDAR SECTION ////////////

    async getPublicListingCalendar({ id, month = '1', year = '2018', count = '1' } = {}) {
        if (!id) {
            _log2.default.e("Airbnbapi: Can't get public listing calendar without an id");
            return null;
        }
        const options = this.buildOptions({
            token: 'public',
            route: '/v2/calendar_months',
            format: 'with_conditions',
            qs: {
                listing_id: id,
                month,
                year,
                count
            }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get public calendar for listing  " + id);
            _log2.default.e(e);
        }
    }

    async getCalendar({ token, id, startDate, endDate } = {}) {
        //log.i(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get a calendar without a token");
            return null;
        } else if (!id) {
            _log2.default.e("Airbnbapi: Can't get a calendar without an id");
            return null;
        } else if (!startDate) {
            _log2.default.e("Airbnbapi: Can't get a calendar without a start date");
            return null;
        } else if (!endDate) {
            _log2.default.e("Airbnbapi: Can't get a calendar without a end date");
            return null;
        }

        const options = this.buildOptions({
            method: 'GET',
            route: '/v2/calendar_days',
            token,
            qs: {
                start_date: startDate,
                listing_id: id,
                _format: 'host_calendar',
                end_date: endDate
            },
            timeout: 10000
        });
        try {
            const response = await (0, _requestPromise2.default)(options).catch(console.log);
            return response.calendar_days;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get calendar for listing " + id);
            _log2.default.e(e);
        }
    }

    async setPriceForDay({ token, id, date, price, currency = this.config.currency }) {
        // console.log(JSON.stringify(this, null, 4))
        const options = this.buildOptions({
            method: 'PUT',
            uri: `https://api.airbnb.com/v2/calendars/${id}/${date}`,
            token,
            currency,
            format: 'host_calendar',
            body: {
                daily_price: price,
                demand_based_pricing_overridden: true,
                availability: 'available'
            },
            timeout: 10000
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't set price for cal day for listing " + id);
            _log2.default.e(e);
        }
    }
    async setAvailabilityForDay({ token, id, date, availability }) {
        const options = this.buildOptions({
            method: 'PUT',
            uri: `https://api.airbnb.com/v2/calendars/${id}/${date}`,
            token,
            format: 'host_calendar',
            body: {
                availability: availability
            },
            timeout: 10000
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't set availability for cal day for listing " + id);
            _log2.default.e(e);
        }
    }

    //////////// LISTING SECTION ////////////
    //////////// LISTING SECTION ////////////
    //////////// LISTING SECTION ////////////

    async setHouseManual({ token, id, manual } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't set a house manual without a token");
            return null;
        } else if (!id) {
            _log2.default.e("Airbnbapi: Can't set a house manual without an id");
            return null;
        } else if (!manual) {
            _log2.default.e("Airbnbapi: Can't set a house manual without manual text");
            return null;
        }
        const options = this.buildOptions({
            method: 'POST',
            route: `/v1/listings/${id}/update`,
            token,
            body: {
                listing: { house_manual: manual }
            }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't set house manual for listing " + id);
            _log2.default.e(e);
        }
    }

    async getListingInfo(id) {
        if (!id) {
            _log2.default.e("Airbnbapi: Can't get public listing information without an id");
            return null;
        }
        const options = this.buildOptions({
            token: 'public',
            route: `/v1/listings/${id}`
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get info for listing  " + id);
            _log2.default.e(e);
        }
    }

    async getListingInfoHost({ token, id } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get a listing without a token");
            return null;
        } else if (!id) {
            _log2.default.e("Airbnbapi: Can't get a listing without an id");
            return null;
        }
        const options = this.buildOptions({
            route: `/v1/listings/${id}`,
            token,
            format: 'v1_legacy_long_manage_listing'
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get listing info for id " + id);
            _log2.default.e(e);
        }
    }

    async getHostSummary(token) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get a summary without a token");
            return null;
        }
        const options = this.buildOptions({
            route: `/v1/account/host_summary`,
            token
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get a host summary for token " + token);
            _log2.default.e(e);
        }
    }

    async getOwnActiveListings(token) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get an active listing list without a token");
            return null;
        }
        const options = this.buildOptions({
            route: `/v1/account/host_summary`,
            token
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            if (response.active_listings) {
                return response.active_listings.map(listing => listing.listing.listing);
            } else {
                return [];
            }
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get an active listing list for token " + token);
            _log2.default.e(e);
        }
    }
    async getOwnListings({ token, userId }) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get an listing list without a token");
            return null;
        }
        const options = this.buildOptions({
            route: `/v2/listings`,
            format: `v1_legacy_long`,
            qs: {
                user_id: userId
            },
            token
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            if (response) {
                return response.listings;
            } else {
                return [];
            }
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get an listing list for token " + token);
            _log2.default.e(e);
        }
    }

    //////////// THREADS SECTION ////////////
    //////////// THREADS SECTION ////////////
    //////////// THREADS SECTION ////////////

    // Gets all the data for one thread
    async getThread({ token, id, currency = this.config.currency } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get a thread without a token");
            return null;
        } else if (!id) {
            _log2.default.e("Airbnbapi: Can't get a thread without an id");
            return null;
        }
        const options = this.buildOptions({
            route: '/v1/threads/' + id,
            token,
            qs: { currency }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response.thread;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get thread " + id);
            _log2.default.e(e);
        }
    }

    async getThreadsBatch({ token, ids, currency = this.config.currency } = {}) {
        //log.i(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get threads without a token");
            return null;
        } else if (!ids) {
            _log2.default.e("Airbnbapi: Can't get threads without at least one id");
            return null;
        }

        const operations = ids.map(id => ({
            method: 'GET',
            path: `/threads/${id}`,
            query: { _format: 'for_messaging_sync_with_posts' }
        }));

        const options = this.buildOptions({
            method: 'POST',
            token,
            currency,
            body: {
                operations,
                _transaction: false
            },
            timeout: 30000
        });
        // log.i(JSON.stringify(options, null, 4))

        let response = {};

        try {
            response = await (0, _requestPromise2.default)(options).catch(_log2.default.e);
            return response.operations.map(o => o.response);
            // log.i(JSON.stringify(response, null, 4))
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get threads for threads " + ids);
            _log2.default.e(e);
        }
    }

    // Gets a list of thread id's for a host
    async getThreadsFull({ token, offset = '0', limit = '2' } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get a thread list without a token");
            return null;
        }
        const options = this.buildOptions({
            route: '/v2/threads',
            token,
            format: 'for_messaging_sync_with_posts',
            qs: { _offset: offset, _limit: limit }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            if (response.threads) {
                return response.threads; //.map(item => item.id)
            } else return null;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get thread list for token " + token);
            _log2.default.e(e);
        }
    }

    // Gets a list of thread id's for a host
    async getThreadFull({ token, id } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get a thread without a token");
            return null;
        }
        if (!id) {
            _log2.default.e("Airbnbapi: Can't get a thread without an id");
            return null;
        }

        const options = this.buildOptions({
            route: `/v2/threads/${id}`,
            token,
            format: 'for_messaging_sync_with_posts'
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            if (response) {
                return response;
            } else return null;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get thread for id " + id);
            _log2.default.e(e);
        }
    }

    // Gets a list of thread id's for a host
    async getThreads({ token, offset = '0', limit = '2' } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get a thread list without a token");
            return null;
        }
        const options = this.buildOptions({
            route: '/v2/threads',
            token,
            qs: { _offset: offset, _limit: limit }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            if (response.threads) {
                return response.threads.map(item => item.id);
            } else return null;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get thread list for token " + token);
            _log2.default.e(e);
        }
    }

    // Create a new thread
    async createThread({ token, id, checkIn, checkOut, guestNum = 1, message } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't create a thread without a token");
            return null;
        } else if (!id) {
            _log2.default.e("Airbnbapi: Can't create a thread without an id");
            return null;
        } else if (!checkIn) {
            _log2.default.e("Airbnbapi: Can't create a thread without a checkin");
            return null;
        } else if (!checkOut) {
            _log2.default.e("Airbnbapi: Can't create a thread without a checkout");
            return null;
        } else if (!message || message.trim() === '') {
            _log2.default.e("Airbnbapi: Can't create a thread without a message body");
            return null;
        }
        const options = this.buildOptions({
            method: 'POST',
            route: '/v1/threads/create',
            token,
            body: {
                listing_id: id,
                number_of_guests: guestNum,
                message: message.trim(),
                checkin_date: checkIn,
                checkout_date: checkOut
            }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't send create thread for listing " + id);
            _log2.default.e(e);
        }
    }

    //////////// RESERVATIONS SECTION ////////////
    //////////// RESERVATIONS SECTION ////////////
    //////////// RESERVATIONS SECTION ////////////

    async getReservations({ token, offset = '0', limit = '20' } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get a reservation list without a token");
            return null;
        }
        const options = this.buildOptions({
            route: '/v2/reservations',
            token,
            format: 'for_mobile_host',
            qs: { _offset: offset, _limit: limit }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response.reservations;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get reservation list for token " + token);
            _log2.default.e(e);
        }
    }

    async getReservationsBatch({ token, ids, currency = this.config.currency } = {}) {
        // TODO change to reservation
        //log.i(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get reservations without a token");
            return null;
        } else if (!ids || !Array.isArray(ids)) {
            _log2.default.e("Airbnbapi: Can't get reservations without at least one id");
            return null;
        }
        const operations = ids.map(id => ({
            method: 'GET',
            path: `/reservations/${id}`,
            query: {
                _format: 'for_mobile_host'
            }
        }));

        const options = this.buildOptions({
            method: 'POST',
            token,
            currency,
            body: {
                operations,
                _transaction: false
            },
            timeout: 30000
        });
        // log.i(JSON.stringify(options, null, 4))
        try {
            const response = await (0, _requestPromise2.default)(options).catch(console.error);
            return response.operations.map(o => o.response);
            // log.i(JSON.stringify(response, null, 4))
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get reservations for ids " + ids);
            _log2.default.e(e);
        }
    }

    async getReservation({ token, id, currency } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get a reservation without a token");
            return null;
        } else if (!id) {
            _log2.default.e("Airbnbapi: Can't get a reservation without an id");
            return null;
        }
        const options = this.buildOptions({
            route: `/v2/reservations/${id}`,
            token,
            format: 'for_mobile_host',
            currency
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response.reservation;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get reservation for token " + token);
            _log2.default.e(e);
        }
    }

    // Send a message to a thread (guest)
    async sendMessage({ token, id, message } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't send a message without a token");
            return null;
        } else if (!id) {
            _log2.default.e("Airbnbapi: Can't send a message without an id");
            return null;
        } else if (!message || message.trim() === '') {
            _log2.default.e("Airbnbapi: Can't send a message without a message body");
            return null;
        }
        _log2.default.i('Airbnbapi: send message for thread: ' + id + ' --');
        _log2.default.i("'" + message.substring(70) + "'");
        const options = this.buildOptions({
            method: 'POST',
            route: '/v2/messages',
            token,
            body: { thread_id: id, message: message.trim() }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't send message for thread " + id);
            _log2.default.e(e);
        }
    }

    // Send pre-approval to an inquiry
    // requires a id. id, and optional message
    async sendPreApproval({ token, thread_id, listing_id, message = '' } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't send pre-approval without a token");
            return null;
        } else if (!thread_id) {
            _log2.default.e("Airbnbapi: Can't send pre-approval without a thread_id");
            return null;
        } else if (!listing_id) {
            _log2.default.e("Airbnbapi: Can't send pre-approval without a listing_id");
            return null;
        }
        const options = this.buildOptions({
            method: 'POST',
            route: `/v1/threads/${thread_id}/update`,
            token,
            body: {
                listing_id,
                message,
                status: 'preapproved'
            }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't send preapproval for thread  " + thread_id);
            _log2.default.e(e);
        }
    }

    async sendReview({
        token,
        id,
        comments = 'They were great guests!',
        private_feedback = 'Thank you for staying!',
        cleanliness = 5,
        communication = 5,
        respect_house_rules = 5,
        recommend = true
    } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't send a review without a token");
            return null;
        } else if (!id) {
            _log2.default.e("Airbnbapi: Can't send review without an id");
            return null;
        }
        const options = this.buildOptions({
            method: 'POST',
            route: `/v1/reviews/${id}/update`,
            token,
            body: {
                comments,
                private_feedback,
                cleanliness,
                communication,
                respect_house_rules,
                recommend
            }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't send a review for thread  " + thread_id);
            _log2.default.e(e);
        }
    }

    async sendSpecialOffer({
        token,
        startDate, //ISO
        guests,
        listingId,
        nights,
        price,
        threadId,
        currency = this.config.currency
    } = {}) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't send a special offer without a token");
            return null;
        } else if (!startDate) {
            _log2.default.e("Airbnbapi: Can't send a special offer without a startDate");
            return null;
        } else if (!guests) {
            _log2.default.e("Airbnbapi: Can't send a special offer without guests");
            return null;
        } else if (!listingId) {
            _log2.default.e("Airbnbapi: Can't send a special offer without a listingId");
            return null;
        } else if (!nights) {
            _log2.default.e("Airbnbapi: Can't send a special offer without nights (staying)");
            return null;
        } else if (!price) {
            _log2.default.e("Airbnbapi: Can't send a special offer without a price");
            return null;
        } else if (!threadId) {
            _log2.default.e("Airbnbapi: Can't send a special offer without a threadId");
            return null;
        }

        const options = this.buildOptions({
            method: 'POST',
            route: '/v2/special_offers',
            token,
            currency,
            body: {
                check_in: startDate, //ISO
                guests,
                listing_id: listingId,
                nights,
                price,
                thread_id: threadId
            }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't send a review for thread  " + thread_id);
            _log2.default.e(e);
        }
    }

    async alterationRequestResponse({
        token,
        reservationId,
        alterationId,
        decision,
        currency = this.config.currency
    }) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't send an alteration request response without a token");
            return null;
        } else if (!reservationId) {
            _log2.default.e("Airbnbapi: Can't send an alteration request response without a reservationId");
            return null;
        } else if (!alterationId) {
            _log2.default.e("Airbnbapi: Can't send an alteration request response without an alterationId");
            return null;
        } else if (!decision) {
            _log2.default.e("Airbnbapi: Can't send an alteration request response without a decision");
            return null;
        }
        const options = this.buildOptions({
            method: 'PUT',
            uri: `https://api.airbnb.com/v2/reservation_alterations/${alterationId}`,
            token,
            currency,
            format: 'for_mobile_alterations_v3_host',
            qs: { reservation_id: reservationId },
            body: {
                reservation_id: reservationId,
                alteration_id: alterationId,
                status: decision ? 1 : 2
            },
            timeout: 10000
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Can't send an alteration request response fro reservation " + reservationId);
            _log2.default.e(e);
        }
    }

    async getGuestInfo(id) {
        if (!id) {
            _log2.default.e("Airbnbapi: Can't get guest info without an id");
            return null;
        }
        const options = this.buildOptions({ token: 'public', route: `/v2/users/${id}` });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response && response.user ? response.user : undefined;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get guest info with user id " + id);
            _log2.default.e(e);
        }
    }

    async getOwnUserInfo(token) {
        if (!(token || this.config.token)) {
            _log2.default.e("Airbnbapi: Can't get user info without a token");
            return null;
        }
        const options = this.buildOptions({ route: '/v2/users/me', token });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response && response.user ? response.user : undefined;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get own info with token" + token);
            _log2.default.e(e);
            return null;
        }
    }

    async listingSearch({
        location = 'New York, United States',
        checkin,
        checkout,
        offset = 0,
        limit = 20,
        language = 'en-US',
        currency = this.config.currency,
        guests,
        instantBook,
        minBathrooms,
        minBedrooms,
        minBeds,
        minPrice,
        maxPrice,
        superhost,
        amenities,
        hostLanguages,
        keywords,
        roomTypes,
        neighborhoods,
        minPicCount,
        sortDirection
    } = {}) {
        const options = this.buildOptions({
            token: 'public',
            route: '/v2/search_results',
            currency,
            qs: {
                locale: language,
                location,
                checkin,
                checkout,
                _offset: offset,
                _limit: limit,
                guests,
                ib: instantBook,
                min_bathrooms: minBathrooms,
                min_bedrooms: minBedrooms,
                min_beds: minBeds,
                price_min: minPrice,
                price_max: maxPrice,
                superhost,
                hosting_amenities: amenities,
                languages: hostLanguages,
                keywords: keywords,
                room_types: roomTypes,
                neighborhoods: neighborhoods,
                min_num_pic_urls: minPicCount,
                sort: sortDirection
            }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't get listings for search of " + location);
            _log2.default.e(e);
        }
    }

    async newAccount({
        username,
        password,
        authenticity_token,
        firstname,
        lastname,
        bdayDay = 1,
        bdayMonth = 1,
        bdayYear = 1980
    } = {}) {
        if (!username) {
            _log2.default.e("Airbnbapi: Can't make a new account without a username");
            return null;
        } else if (!password) {
            _log2.default.e("Airbnbapi: Can't make a new account without a password");
            return null;
        } else if (!authenticity_token) {
            _log2.default.e("Airbnbapi: Can't make a new account without an authenticity_token");
            return null;
        } else if (!authenticity_token) {
            _log2.default.e("Airbnbapi: Can't make a new account without a firstname");
            return null;
        } else if (!authenticity_token) {
            _log2.default.e("Airbnbapi: Can't make a new account without a lastname");
            return null;
        }
        const options = this.buildOptions({
            method: 'POST',
            uri: 'https://www.airbnb.com/create/',
            form: {
                authenticity_token,
                from: 'email_signup',
                'user[email]': username,
                'user[first_name]': firstname,
                'user[last_name]': lastname,
                'user[password]': password,
                'user[birthday_day]': bdayDay,
                'user[birthday_month]': bdayMonth,
                'user[birthday_year]': bdayYear,
                'user_profile_info[receive_promotional_email]': 0
            }
        });
        try {
            const response = await (0, _requestPromise2.default)(options);
            return response;
        } catch (e) {
            _log2.default.e("Airbnbapi: Couldn't make new account for username " + username);
            _log2.default.e(e);
        }
    }
}

const abba = new AirApi();
module.exports = abba;