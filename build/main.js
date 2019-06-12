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
        currency = 'JPY',
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
            throw Error('Airbnbapi: No token included for testAuth() call');
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
            throw Error("Airbnbapi: Can't apply for a token without a username.");
        } else if (!password) {
            throw Error("Airbnbapi: Can't apply for a token without a password.");
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

        const response = await (0, _requestPromise2.default)(options);
        if (response && response.access_token) {
            _log2.default.i(`Airbnbapi: Successful login for [${username}], auth ID is [${response.access_token}]`);
            return { token: response.access_token };
        } else {
            throw Error('Airbnbapi: no response from server when fetching token');
        }
    }

    async login({ email, password } = {}) {
        if (!email) {
            throw Error("Airbnbapi: Can't login without an email.");
        } else if (!password) {
            throw Error("Airbnbapi: Can't apply for a token without a password.");
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
        const response = await (0, _requestPromise2.default)(options);
        if (response && response.login) {
            _log2.default.i(`Airbnbapi: Successful login for [${email}], auth ID is [${response.login.id}]`);
            return response;
        } else {
            throw Error('Airbnbapi: no response from server when fetching token');
        }
    }

    //////////// CALENDAR SECTION ////////////
    //////////// CALENDAR SECTION ////////////
    //////////// CALENDAR SECTION ////////////

    async getPublicListingCalendar({ id, month = '1', year = '2018', count = '1' } = {}) {
        if (!id) {
            throw Error("Airbnbapi: Can't get public listing calendar without an id");
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
        return await (0, _requestPromise2.default)(options);
    }

    async getCalendar({ token, id, startDate, endDate } = {}) {
        //log.i(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get a calendar without a token");
        } else if (!id) {
            throw Error("Airbnbapi: Can't get a calendar without an id");
        } else if (!startDate) {
            throw Error("Airbnbapi: Can't get a calendar without a start date");
        } else if (!endDate) {
            throw Error("Airbnbapi: Can't get a calendar without a end date");
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
        const response = await (0, _requestPromise2.default)(options);
        return response.calendar_days;
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
        return await (0, _requestPromise2.default)(options);
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

        return await (0, _requestPromise2.default)(options);
    }

    //////////// LISTING SECTION ////////////
    //////////// LISTING SECTION ////////////
    //////////// LISTING SECTION ////////////

    async setHouseManual({ token, id, manual } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't set a house manual without a token");
        } else if (!id) {
            throw Error("Airbnbapi: Can't set a house manual without an id");
        } else if (!manual) {
            throw Error("Airbnbapi: Can't set a house manual without manual text");
        }
        const options = this.buildOptions({
            method: 'POST',
            route: `/v1/listings/${id}/update`,
            token,
            body: {
                listing: { house_manual: manual }
            }
        });
        return await (0, _requestPromise2.default)(options);
    }

    async getListingInfo(id) {
        if (!id) {
            throw Error("Airbnbapi: Can't get public listing information without an id");
        }
        const options = this.buildOptions({
            token: 'public',
            route: `/v1/listings/${id}`
        });
        const response = await (0, _requestPromise2.default)(options);
        return response;
    }

    async getListingInfoHost({ token, id } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get a listing without a token");
        } else if (!id) {
            throw Error("Airbnbapi: Can't get a listing without an id");
        }
        const options = this.buildOptions({
            route: `/v1/listings/${id}`,
            token,
            format: 'v1_legacy_long_manage_listing'
        });
        return await (0, _requestPromise2.default)(options);
    }

    async getHostSummary(token) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get a summary without a token");
        }
        const options = this.buildOptions({
            route: `/v1/account/host_summary`,
            token
        });
        return await (0, _requestPromise2.default)(options);
    }

    async getOwnActiveListings(token) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get an active listing list without a token");
        }
        const options = this.buildOptions({
            route: `/v1/account/host_summary`,
            token
        });

        const response = await (0, _requestPromise2.default)(options);
        if (response.active_listings) {
            return response.active_listings.map(listing => listing.listing.listing);
        } else {
            return [];
        }
    }
    async getOwnListings({ token, userId }) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get an listing list without a token");
        }
        const options = this.buildOptions({
            route: `/v2/listings`,
            format: `v1_legacy_long`,
            qs: {
                user_id: userId
            },
            token
        });
        const response = await (0, _requestPromise2.default)(options);
        if (response) {
            return response.listings;
        } else {
            return [];
        }
    }

    //////////// THREADS SECTION ////////////
    //////////// THREADS SECTION ////////////
    //////////// THREADS SECTION ////////////

    // Gets all the data for one thread
    async getThread({ token, id, currency = this.config.currency } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get a thread without a token");
        } else if (!id) {
            throw Error("Airbnbapi: Can't get a thread without an id");
        }
        const options = this.buildOptions({
            route: '/v1/threads/' + id,
            token,
            qs: { currency }
        });
        const response = await (0, _requestPromise2.default)(options);
        return response.thread;
    }

    async getThreadsBatch({ token, ids, currency = this.config.currency } = {}) {
        //log.i(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get threads without a token");
        } else if (!ids) {
            throw Error("Airbnbapi: Can't get threads without at least one id");
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

        const response = await (0, _requestPromise2.default)(options);
        return response.operations.map(o => o.response);
    }

    // Gets a list of thread id's for a host
    async getThreadsFull({ token, offset = '0', limit = '2' } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get a thread list without a token");
        }
        const options = this.buildOptions({
            route: '/v2/threads',
            token,
            format: 'for_messaging_sync_with_posts',
            qs: { _offset: offset, _limit: limit }
        });
        const response = await (0, _requestPromise2.default)(options);
        if (response.threads) {
            return response.threads; //.map(item => item.id)
        } else return [];
    }

    // Gets a list of thread id's for a host
    async getThreadFull({ token, id } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get a thread without a token");
        }
        if (!id) {
            throw Error("Airbnbapi: Can't get a thread without an id");
        }

        const options = this.buildOptions({
            route: `/v2/threads/${id}`,
            token,
            format: 'for_messaging_sync_with_posts'
        });
        return await (0, _requestPromise2.default)(options);
    }

    // Gets a list of thread id's for a host
    async getThreads({ token, offset = '0', limit = '2' } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get a thread list without a token");
        }
        const options = this.buildOptions({
            route: '/v2/threads',
            token,
            qs: { _offset: offset, _limit: limit }
        });
        const response = await (0, _requestPromise2.default)(options);
        if (response.threads) {
            return response.threads.map(item => item.id);
        } else return [];
    }

    // Create a new thread
    async createThread({ token, id, checkIn, checkOut, guestNum = 1, message } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't create a thread without a token");
        } else if (!id) {
            throw Error("Airbnbapi: Can't create a thread without an id");
        } else if (!checkIn) {
            throw Error("Airbnbapi: Can't create a thread without a checkin");
        } else if (!checkOut) {
            throw Error("Airbnbapi: Can't create a thread without a checkout");
        } else if (!message || message.trim() === '') {
            throw Error("Airbnbapi: Can't create a thread without a message body");
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
        return await (0, _requestPromise2.default)(options);
    }

    //////////// RESERVATIONS SECTION ////////////
    //////////// RESERVATIONS SECTION ////////////
    //////////// RESERVATIONS SECTION ////////////

    async getReservations({ token, offset = '0', limit = '20' } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get a reservation list without a token");
        }
        const options = this.buildOptions({
            route: '/v2/reservations',
            token,
            format: 'for_mobile_host',
            qs: { _offset: offset, _limit: limit }
        });
        const response = await (0, _requestPromise2.default)(options);
        return response.reservations;
    }

    async getReservationsBatch({ token, ids, currency = this.config.currency } = {}) {
        // TODO change to reservation
        //log.i(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get reservations without a token");
        } else if (!ids || !Array.isArray(ids)) {
            throw Error("Airbnbapi: Can't get reservations without at least one id");
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
        const response = await (0, _requestPromise2.default)(options);
        return response.operations.map(o => o.response);
    }

    async getReservation({ token, id, currency } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get a reservation without a token");
        } else if (!id) {
            throw Error("Airbnbapi: Can't get a reservation without an id");
        }
        const options = this.buildOptions({
            route: `/v2/reservations/${id}`,
            token,
            format: 'for_mobile_host',
            currency
        });
        const response = await (0, _requestPromise2.default)(options);
        return response.reservation;
    }

    // Send a message to a thread (guest)
    async sendMessage({ token, id, message } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't send a message without a token");
        } else if (!id) {
            throw Error("Airbnbapi: Can't send a message without an id");
        } else if (!message || message.trim() === '') {
            throw Error("Airbnbapi: Can't send a message without a message body");
        }
        _log2.default.i('Airbnbapi: send message for thread: ' + id + ' --');
        _log2.default.i("'" + message.substring(70) + "'");
        const options = this.buildOptions({
            method: 'POST',
            route: '/v2/messages',
            token,
            body: { thread_id: id, message: message.trim() }
        });
        return await (0, _requestPromise2.default)(options);
    }

    // Send pre-approval to an inquiry
    // requires a id. id, and optional message
    async sendPreApproval({ token, thread_id, listing_id, message = '' } = {}) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't send pre-approval without a token");
        } else if (!thread_id) {
            throw Error("Airbnbapi: Can't send pre-approval without a thread_id");
        } else if (!listing_id) {
            throw Error("Airbnbapi: Can't send pre-approval without a listing_id");
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
        return await (0, _requestPromise2.default)(options);
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
            throw Error("Airbnbapi: Can't send a review without a token");
        } else if (!id) {
            throw Error("Airbnbapi: Can't send review without an id");
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
        return await (0, _requestPromise2.default)(options);
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
            throw Error("Airbnbapi: Can't send a special offer without a token");
        } else if (!startDate) {
            throw Error("Airbnbapi: Can't send a special offer without a startDate");
        } else if (!guests) {
            throw Error("Airbnbapi: Can't send a special offer without guests");
        } else if (!listingId) {
            throw Error("Airbnbapi: Can't send a special offer without a listingId");
        } else if (!nights) {
            throw Error("Airbnbapi: Can't send a special offer without nights (staying)");
        } else if (!price) {
            throw Error("Airbnbapi: Can't send a special offer without a price");
        } else if (!threadId) {
            throw Error("Airbnbapi: Can't send a special offer without a threadId");
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
        return await (0, _requestPromise2.default)(options);
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
        return await (0, _requestPromise2.default)(options);
    }

    async getGuestInfo(id) {
        if (!id) {
            throw Error("Airbnbapi: Can't get guest info without an id");
        }
        const options = this.buildOptions({ token: 'public', route: `/v2/users/${id}` });
        const response = await (0, _requestPromise2.default)(options);
        return response && response.user ? response.user : null;
    }

    async getOwnUserInfo(token) {
        if (!(token || this.config.token)) {
            throw Error("Airbnbapi: Can't get user info without a token");
        }
        const options = this.buildOptions({ route: '/v2/users/me', token });
        const response = await (0, _requestPromise2.default)(options);
        return response && response.user ? response.user : null;
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
        return await (0, _requestPromise2.default)(options);
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
            throw Error("Airbnbapi: Can't make a new account without a username");
        } else if (!password) {
            throw Error("Airbnbapi: Can't make a new account without a password");
        } else if (!authenticity_token) {
            throw Error("Airbnbapi: Can't make a new account without an authenticity_token");
        } else if (!authenticity_token) {
            throw Error("Airbnbapi: Can't make a new account without a firstname");
        } else if (!authenticity_token) {
            throw Error("Airbnbapi: Can't make a new account without a lastname");
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
        return await (0, _requestPromise2.default)(options);
    }
}

const abba = new AirApi();
module.exports = abba;