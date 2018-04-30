import requestPromise from 'request-promise'

const LOGLEVEL = process.env.LOGLEVEL || 'none'

const log = {
    i: obj => {
        if (LOGLEVEL === 'info' || LOGLEVEL === 'error' || LOGLEVEL === 'debug') console.log(obj)
    },
    e: obj => {
        if (LOGLEVEL === 'info' || LOGLEVEL === 'error') console.error(obj)
    },
    d: obj => {
        if (LOGLEVEL === 'debug') console.error(obj)
    }
}

class AirApi {
    constructor() {
        this.config = {
            API_KEY: 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
            DEFAULT_HEADER: {
                // 'User-Agent': 'Mozillaz/5.0 (Windows NT 6.1)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
                'User-Agent':
                    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
                // 'User-Agent': 'TESTING API'
                // 'User-Agent': randomUseragent.getRandom()
            },
            DEFAULT_PARAMETERS: {
                key: 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
                currency: 'JPY'
            }
        }
    }

    //////////// HEADER SECTION ////////////
    //////////// HEADER SECTION ////////////
    //////////// HEADER SECTION ////////////

    // returns the typical request header used for all logged in endpoints.
    makeAuthHeader(token) {
        if (!token) {
            log.i('Airbnbapi: No token included for makeAuthHeader() call')
            return null
        } else {
            return {
                ...this.config.DEFAULT_HEADER,
                // 'User-Agent': randomUseragent.getRandom(),
                'X-Airbnb-OAuth-Token': token,
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }
    }

    //////////// AUTH SECTION ////////////
    //////////// AUTH SECTION ////////////
    //////////// AUTH SECTION ////////////

    // Ping server to see if the token is good.
    async testAuth(token) {
        if (!token) {
            log.i('Airbnbapi: No token included for testAuth() call')
            return null
        } else {
            const options = {
                method: 'POST',
                uri: 'https://api.airbnb.com/v2/batch',
                json: true,
                headers: this.makeAuthHeader(token),
                qs: this.config.DEFAULT_PARAMETERS,
                body: { operations: [] }
            }
            let response = await requestPromise(options).catch(e => {})
            // console.log(JSON.stringify(response, null, 4))
            // log.i(JSON.stringify(response, null, 4))
            return response ? true : false
        }
    }

    // Grab a new auth token using a 'username and password' login method.
    async newAccessToken({ username, password } = {}) {
        if (!username) {
            log.e("Airbnbapi: Can't apply for a token without a username.")
            return null
        } else if (!password) {
            log.e("Airbnbapi: Can't apply for a token without a password.")
            return null
        }
        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v1/authorize',
            headers: this.config.DEFAULT_HEADER,
            body: {
                grant_type: 'password',
                username,
                password
            },
            json: true
        }

        try {
            var response = await requestPromise(options)
        } catch (e) {
            // if(e.response.access_token) {
            //     log.i('Airbnbapi: Successful login for [ ' + username + ' ], auth ID is [ ' + e.response.access_token + ' ]')
            //     return { token: e.response.access_token }
            // }
            // log.i(JSON.stringify(e, null, 4))
            log.e("Airbnbapi: Couldn't get auth token for " + username)
            log.e(e.error)
            return { error: e.error }
        }
        if (response && response.access_token) {
            log.i(
                'Airbnbapi: Successful login for [ ' +
                    username +
                    ' ], auth ID is [ ' +
                    response.access_token +
                    ' ]'
            )
            return { token: response.access_token }
        } else {
            log.e('Airbnbapi: no response from server when fetching token')
            return null
        }
    }

    async login({ email, password } = {}) {
        if (!email) {
            log.e("Airbnbapi: Can't login without an email.")
            log.e('email: ' + email)
            log.e("Please call login({email: '#######', password: '#######'})")
            return null
        } else if (!password) {
            log.e("Airbnbapi: Can't apply for a token without a password.")
            log.e('Password: ' + password)
            log.e("Please call login({email: '#######', password: '#######'})")
            return null
        }
        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v2/logins',
            headers: this.config.DEFAULT_HEADER,
            qs: this.config.DEFAULT_PARAMETERS,
            form: {
                email,
                password
            },
            json: true
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get auth token for " + email)
            log.e(e.error)
            return { error: e.error }
        }
        if (response && response.login) {
            log.i(
                'Airbnbapi: Successful login for [ ' +
                    email +
                    ' ], auth ID is [ ' +
                    response.login.id +
                    ' ]'
            )
            return response
        } else {
            log.e('Airbnbapi: no response from server when fetching token')
            return null
        }
    }

    //////////// CALENDAR SECTION ////////////
    //////////// CALENDAR SECTION ////////////
    //////////// CALENDAR SECTION ////////////

    async getPublicListingCalendar({ id, month = '1', year = '2018', count = '1' } = {}) {
        if (!id) {
            log.e("Airbnbapi: Can't get public listing calendar without an id")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/calendar_months',
            json: true,
            qs: {
                // key: this.config.API_KEY,
                // _format: 'v1_legacy_for_p3',
                listing_id: id,
                month,
                year,
                count,
                _format: 'with_conditions'
            }
        };
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get public calendar for listing  " + id)
            log.e(e)
        } finally {
            return response ? response : null
        }
    }

    async getCalendar({ token, id, startDate, endDate } = {}) {
        //log.i(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if (!token) {
            log.e("Airbnbapi: Can't get a calendar without a token")
            return null
        } else if (!id) {
            log.e("Airbnbapi: Can't get a calendar without an id")
            return null
        } else if (!startDate) {
            log.e("Airbnbapi: Can't get a calendar without a start date")
            return null
        } else if (!endDate) {
            log.e("Airbnbapi: Can't get a calendar without a end date")
            return null
        }

        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v2/batch',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: this.config.DEFAULT_PARAMETERS,
            body: {
                operations: [
                    {
                        method: 'GET',
                        path: '/calendar_days',
                        query: {
                            start_date: startDate,
                            listing_id: id,
                            _format: 'host_calendar',
                            end_date: endDate
                        }
                    },
                    {
                        method: 'GET',
                        path: '/dynamic_pricing_controls/' + id,
                        query: {}
                    }
                ],
                _transaction: false
            },
            timeout: 10000
        }
        let response = {}
        try {
            response = await requestPromise(options).catch(console.log)
            return response.operations[0].response.calendar_days
        } catch (e) {
            log.e("Airbnbapi: Couldn't get calendar for listing " + id)
            log.e(e)
        }
    }

    async setPriceForDay({
        token,
        id,
        date,
        price,
        currency = this.config.DEFAULT_PARAMETERS.currency
    }) {
        // console.log(JSON.stringify(this, null, 4))
        const options = {
            method: 'PUT',
            uri: `https://api.airbnb.com/v2/calendars/${id}/${date}`,
            json: true,
            headers: this.makeAuthHeader(token),
            qs: {
                ...this.config.DEFAULT_PARAMETERS,
                currency,
                _format: 'host_calendar'
            },
            body: {
                daily_price: price,
                demand_based_pricing_overridden: true,
                availability: 'available'
            },
            timeout: 10000
        }
        let response = {}
        try {
            response = await requestPromise(options)
            return response
        } catch (e) {
            log.e("Airbnbapi: Couldn't set price for cal day for listing " + id)
            log.e(e)
        }
    }
    async setAvailabilityForDay({ token, id, date, availability }) {
        const options = {
            method: 'PUT',
            uri: `https://api.airbnb.com/v2/calendars/${id}/${date}`,
            json: true,
            headers: this.makeAuthHeader(token),
            qs: {
                ...this.config.DEFAULT_PARAMETERS,
                _format: 'host_calendar'
            },
            body: {
                availability: availability
            },
            timeout: 10000
        }
        let response = {}
        try {
            response = await requestPromise(options)
            return response
        } catch (e) {
            log.e("Airbnbapi: Couldn't set availability for cal day for listing " + id)
            log.e(e)
        }
    }

    //////////// LISTING SECTION ////////////
    //////////// LISTING SECTION ////////////
    //////////// LISTING SECTION ////////////

    async setHouseManual({token, id, manual} = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't set a house manual without a token")
            return null
        } else if (!id) {
            log.e("Airbnbapi: Can't set a house manual without an id")
            return null
        } else if (!manual) {
            log.e("Airbnbapi: Can't set a house manual without manual text")
            return null
        }
        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v1/listings/' + id + '/update',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: this.config.DEFAULT_PARAMETERS,
            body: {
                listing: { house_manual: manual }
            }
        }
        // let response = await requestPromise(options).catch(logger.info)
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't set house manual for listing " + id)
            log.e(e)
        } finally {
            return response
        }
    }

    async getListingInfo({id} = {}) {
        if (!id) {
            log.e("Airbnbapi: Can't get public listing information without an id")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/listings/' + id,
            json: true,
            qs: {
                key: this.config.API_KEY,
                _format: 'v1_legacy_for_p3'
            }
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get info for listing  " + id)
            log.e(e)
        } finally {
            return response ? response : null
        }
    }

    async getListingInfoHost({ token, id } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't get a listing without a token")
            return null
        } else if (!id) {
            log.e("Airbnbapi: Can't get a listing without an id")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v1/listings/' + id,
            json: true,
            headers: this.makeAuthHeader(token),
            qs: {
                ...this.config.DEFAULT_PARAMETERS,
                _format: 'v1_legacy_long_manage_listing'
            }
        }
        // let response = await requestPromise(options).catch(logger.info)
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get listing info for id " + id)
            log.e(e)
        } finally {
            return response
        }
    }

    //////////// THREADS SECTION ////////////
    //////////// THREADS SECTION ////////////
    //////////// THREADS SECTION ////////////

    // Gets all the data for one thread
    async getThread({ token, id, currency = this.config.DEFAULT_PARAMETERS.currency } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't get a thread without a token")
            return null
        } else if (!id) {
            log.e("Airbnbapi: Can't get a thread without an id")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v1/threads/' + id,
            json: true,
            headers: this.makeAuthHeader(token),
            qs: { ...this.config.DEFAULT_PARAMETERS, currency }
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get thread " + id)
            log.e(e)
        } finally {
            return response.thread
        }
    }

    async getThreadsBatch({ token, ids, currency = this.config.DEFAULT_PARAMETERS.currency } = {}) {
        //log.i(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if (!token) {
            log.e("Airbnbapi: Can't get threads without a token")
            return null
        } else if (!ids) {
            log.e("Airbnbapi: Can't get threads without at least one id")
            return null
        }

        const operations = ids.map(id => ({
            method: 'GET',
            path: '/threads/' + id,
            query: {
                _format: 'for_messaging_sync_with_posts'
            }
        }))

        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v2/batch/',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: { ...this.config.DEFAULT_PARAMETERS, currency },
            body: {
                operations,
                _transaction: false
            },
            timeout: 30000
        }
        // log.i(JSON.stringify(options, null, 4))

        let response = {}

        try {
            response = await requestPromise(options).catch(log.e)
            return response.operations.map(o => o.response)
            // log.i(JSON.stringify(response, null, 4))
        } catch (e) {
            log.e("Airbnbapi: Couldn't get threads for threads " + ids)
            log.e(e)
        }
    }

    // Gets a list of thread id's for a host
    async getThreadsFull({ token, offset = '0', limit = '2' } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't get a thread list without a token")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/threads',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: {
                ...this.config.DEFAULT_PARAMETERS,
                _offset: offset,
                _limit: limit,
                _format: 'for_messaging_sync'
            }
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get thread list for token " + token)
            log.e(e)
        } finally {
            if (response.threads != undefined) {
                response = response.threads.map(item => item.id)
                return response
            } else return null
        }
    }

    // Gets a list of thread id's for a host
    async getThreads({ token, offset = '0', limit = '2' } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't get a thread list without a token")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/threads',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: Object.assign({}, this.config.DEFAULT_PARAMETERS, {
                _offset: offset,
                _limit: limit
            })
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get thread list for token " + token)
            log.e(e)
        } finally {
            if (response.threads != undefined) {
                response = response.threads.map(item => item.id)
                return response
            } else return null
        }
    }

    // Create a new thread
    async createThread({ token, id, checkin, checkout, guestNum = '1', message } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't create a thread without a token")
            return null
        } else if (!id) {
            log.e("Airbnbapi: Can't create a thread without an id")
            return null
        } else if (!checkin) {
            log.e("Airbnbapi: Can't create a thread without a checkin")
            return null
        } else if (!checkout) {
            log.e("Airbnbapi: Can't create a thread without a checkout")
            return null
        } else if (!message) {
            log.e("Airbnbapi: Can't create a thread without a message body")
            return null
        }

        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v1/threads/create',
            headers: this.makeAuthHeader(token),
            form: {
                listing_id: id,
                number_of_guests: guestNum,
                message: message || '',
                checkin_date: checkin,
                checkout_date: checkout
            },
            json: true
        }

        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't send create thread for listing " + id)
            log.e(e)
        } finally {
            return response
        }
    }

    //////////// RESERVATIONS SECTION ////////////
    //////////// RESERVATIONS SECTION ////////////
    //////////// RESERVATIONS SECTION ////////////

    async getReservations({ token, offset = '0', limit = '20' } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't get a reservation list without a token")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/reservations',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: Object.assign({}, this.config.DEFAULT_PARAMETERS, {
                _offset: offset,
                _limit: limit,
                _format: 'for_mobile_host'
            })
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get reservation list for token " + token)
            log.e(e)
        } finally {
            return response != undefined ? response.threads : null
        }
    }

    async getReservationsBatch({ token, ids } = {}) {
        // TODO change to reservation
        //log.i(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if (!token) {
            log.e("Airbnbapi: Can't get reservations without a token")
            return null
        } else if (!ids) {
            log.e("Airbnbapi: Can't get reservations without at least one id")
            return null
        }

        const operations = ids.map(id => ({
            method: 'GET',
            path: '/reservations/' + id,
            query: {
                _format: 'for_mobile_host'
            }
        }))

        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v2/batch/',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: this.config.DEFAULT_PARAMETERS,
            body: {
                operations,
                _transaction: false
            },
            timeout: 30000
        }
        // log.i(JSON.stringify(options, null, 4))

        let response = {}

        try {
            response = await requestPromise(options).catch(console.error)
            return response.operations.map(o => o.response)
            // log.i(JSON.stringify(response, null, 4))
        } catch (e) {
            log.e("Airbnbapi: Couldn't get reservations for ids " + ids)
            log.e(e)
        }
    }

    async getReservation({ token, id } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't get a reservation list without a token")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/reservations/' + id,
            json: true,
            headers: this.makeAuthHeader(token),
            qs: Object.assign({}, this.config.DEFAULT_PARAMETERS, {
                _format: 'for_mobile_host'
            })
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get reservation list for token " + token)
            log.e(e)
        } finally {
            return response != undefined ? response.threads : null
        }
    }

    // Send a message to a thread (guest)
    async sendMessage({ token, id, message } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't send a message without a token")
            return null
        } else if (!id) {
            log.e("Airbnbapi: Can't send a message without an id")
            return null
        } else if (!message) {
            log.e("Airbnbapi: Can't send a message without a message body")
            return null
        }
        log.i('Airbnbapi: send message for thread: ' + id + ' --')
        log.i("'" + message.substring(70) + "'")
        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v2/messages',
            headers: this.makeAuthHeader(token),
            body: {
                thread_id: id,
                message: message
            },
            json: true
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't send message for thread " + id)
            log.e(e)
        } finally {
            return response
        }
    }

    // Send pre-approval to an inquiry
    // requires a id. id, and optional message
    async sendPreApproval({ token, thread_id, listing_id, message = '' } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't send pre-approval without a token")
            return null
        } else if (!thread_id) {
            log.e("Airbnbapi: Can't send pre-approval without an id")
            return null
        } else if (!listing_id) {
            log.e("Airbnbapi: Can't send pre-approval without a token")
            return null
        }
        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v1/threads/' + thread_id + '/update',
            headers: this.makeAuthHeader(token),
            form: {
                listing_id,
                message,
                status: 'preapproved'
            },
            json: true
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't send pre approval for thread  " + thread_id)
            log.e(e)
        } finally {
            return response
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
        if (!token) {
            log.e("Airbnbapi: Can't send a review without a token")
            return null
        } else if (!id) {
            log.e("Airbnbapi: Can't send review without an id")
            return null
        }
        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v1/reviews/' + id + '/update',
            headers: this.makeAuthHeader(token),
            body: {
                comments,
                private_feedback,
                cleanliness,
                communication,
                respect_house_rules,
                recommend
            },
            json: true
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't send a review for thread  " + thread_id)
            log.e(e)
        } finally {
            return response
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
        currency = this.config.DEFAULT_PARAMETERS.currency
    } = {}) {
        if (!token) {
            log.e("Airbnbapi: Can't send a special offer without a token")
            return null
        } else if (!startDate) {
            log.e("Airbnbapi: Can't send a special offer without a startDate")
            return null
        } else if (!guests) {
            log.e("Airbnbapi: Can't send a special offer without guests")
            return null
        } else if (!listingId) {
            log.e("Airbnbapi: Can't send a special offer without a listingId")
            return null
        } else if (!nights) {
            log.e("Airbnbapi: Can't send a special offer without nights (staying)")
            return null
        } else if (!price) {
            log.e("Airbnbapi: Can't send a special offer without a price")
            return null
        } else if (!threadId) {
            log.e("Airbnbapi: Can't send a special offer without a threadId")
            return null
        }

        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v2/special_offers',
            headers: this.makeAuthHeader(token),
            qs: { ...this.config.DEFAULT_PARAMETERS, currency },
            body: {
                check_in: startDate, //ISO
                guests,
                listing_id: listingId,
                nights,
                price,
                thread_id: threadId
            },
            json: true
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't send a review for thread  " + thread_id)
            log.e(e)
        } finally {
            return response
        }
    }

    async getGuestInfo(id) {
        if (!id) {
            log.e("Airbnbapi: Can't get guest info without an id")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/users/' + id,
            json: true,
            qs: {
                key: this.config.API_KEY
            }
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get guest info with user id " + id)
            log.e(e)
        } finally {
            return response && response.user ? response.user : null
        }
    }

    async getOwnUserInfo(token) {
        if (!token) {
            log.e("Airbnbapi: Can't get user info without a token")
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/users/me',
            headers: this.makeAuthHeader(token),
            json: true,
            qs: {
                key: this.config.API_KEY
            }
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get own info with token" + token)
            log.e(e)
        } finally {
            return response && response.user ? response.user : null
        }
    }

    async listingSearch({
        location = 'New York, United States',
        offset = 0,
        limit = 20,
        language = 'en-US',
        currency = 'USD'
    } = {}) {
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/search_results',
            json: true,
            qs: {
                key: this.config.API_KEY,
                locale: language,
                currency,
                location,
                _offset: offset,
                _limit: limit
            }
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't get listings for search of " + location)
            log.e(e)
        } finally {
            return response ? response : null
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
            log.e("Airbnbapi: Can't make a new account without a username")
            return null
        } else if (!password) {
            log.e("Airbnbapi: Can't make a new account without a password")
            return null
        } else if (!authenticity_token) {
            log.e("Airbnbapi: Can't make a new account without an authenticity_token")
            return null
        } else if (!authenticity_token) {
            log.e("Airbnbapi: Can't make a new account without a firstname")
            return null
        } else if (!authenticity_token) {
            log.e("Airbnbapi: Can't make a new account without a lastname")
            return null
        }
        const options = {
            method: 'POST',
            uri: 'https://www.airbnb.com/create/',
            headers: this.config.DEFAULT_HEADER,
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
            },
            json: true
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            log.e("Airbnbapi: Couldn't make new account for username " + username)
            log.e(e)
        } finally {
            return response ? response : null
        }
    }
}

const abba = new AirApi()
module.exports = abba
