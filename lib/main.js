import requestPromise from 'request-promise'
import moment from 'moment'
import winston from 'winston'

let logger

if (process.env.NODE_ENV !== 'test') {
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)()
            // new (winston.transports.File)({ filename: 'logs/main.log', options: { flags: 'w' } })
        ]
    })
} else {
    // while testing, log only to file, leaving stdout free for unit test status messages
    logger = new (winston.Logger)({
        transports: [
            // new (winston.transports.Console)(),
            new (winston.transports.File)({ filename: 'logs/main.log', options: { flags: 'w' } })
        ]
    })
}

class AirApi {
    constructor() {
        this.config = {
            API_KEY: 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
            DEFAULT_HEADER: {
                'User-Agent': 'Mozillaz/5.0 (Windows NT 6.1)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
                // 'User-Agent': 'TESTING API'
            },
            DEFAULT_PARAMETERS : {
                key : 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
                currency : 'JPY'
            }
        }
    }
    //////////// HEADER SECTION ////////////
    //////////// HEADER SECTION ////////////
    //////////// HEADER SECTION ////////////

    // returns the typical request header used for all logged in endpoints.
    makeAuthHeader(token)
    {
        if(!token) {
            logger.debug('Airbnbapi: No token included for makeAuthHeader() call')
            return null
        }
        else {
            return {
                ...this.config.DEFAULT_HEADER,
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
        if(!token) {
            logger.debug('Airbnbapi: No token included for testAuth() call')
            return null
        }
        else {
            const options = {
                method: 'POST',
                uri: 'https://api.airbnb.com/v2/batch/',
                json: true,
                headers: this.makeAuthHeader(token),
                qs: this.config.DEFAULT_PARAMETERS,
                body: { operations: [] }
            }
            let response = await requestPromise(options).catch(error => {})
            return (response != undefined) ? true : false
        }
    }

    // Grab a new auth token with username and password login.
    async newAccessToken({username, password} = {}) {
        if(!username) {
            logger.error('Airbnbapi: Can\'t apply for a token without a username.')
            logger.error('Username: ' + username)
            logger.error('Please call newAccessToken({username: \'#######\', password: \'#######\'})')
            return null
        }
        else if(!password) {
            logger.error('Airbnbapi: Can\'t apply for a token without a password.')
            logger.error('Password: ' + password)
            logger.error('Please call newAccessToken({username: \'#######\', password: \'#######\'})')
            return null
        }
        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v1/authorize',
            headers: this.config.DEFAULT_HEADER,
            form: {
                grant_type: 'password',
                username,
                password,
                key: this.config.API_KEY
            },
            json: true
        }

        try {
            var response = await requestPromise(options)
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t get auth token for ' + username )
            logger.error(e)
        } finally {
            if(response != undefined) {
                logger.info('Airbnbapi: Successful login for [ ' + username + ' ], auth ID is [ ' + response.access_token + ' ]')
                return response.access_token
            }
            else {
                return null
            }
        }
    }

    //////////// CALENDAR SECTION ////////////
    //////////// CALENDAR SECTION ////////////
    //////////// CALENDAR SECTION ////////////

    async setPriceForDay({token, id, date, price}) {

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
                daily_price: price,
                demand_based_pricing_overridden: true,
                availability: "available"
            },
            timeout: 10000

        }
        // console.log(JSON.stringify(options, null, 4))

        let response = {}

        try {
            response = await requestPromise(options)
            // console.log(JSON.stringify(response, null, 4))
            return response
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t get calendar for listing ' + id )
            logger.error(e)
        }
    }

    // gets calendar data for a listing
    async getCalendar({token, id, startDate, endDate} = {}) {
        //logger.info(colors.magenta('Airbnbapi: Requesting calendar for [ ' + id + ' ] --'))
        if(!token) {
            logger.error('Airbnbapi: Can\'t get a calendar without a token')
            return null
        } else if(!id) {
            logger.error('Airbnbapi: Can\'t get a calendar without an id')
            return null
        } else if(!startDate) {
            logger.error('Airbnbapi: Can\'t get a calendar without a start date')
            return null
        } else if(!endDate) {
            logger.error('Airbnbapi: Can\'t get a calendar without a end date')
            return null
        }

        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v2/batch/',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: this.config.DEFAULT_PARAMETERS,
            body: {
                operations: [{
                    method: 'GET',
                    path: '/calendar_days',
                    query: {
                        start_date: startDate,
                        listing_id: id,
                        _format: 'host_calendar',
                        end_date: endDate
                    }
                }, {
                    method: 'GET',
                    path: '/dynamic_pricing_controls/' + id,
                    query: {}
                }],
                _transaction: false
            },
            timeout: 10000

        }
        // console.log(JSON.stringify(options, null, 4))

        let response = {}

        try {
            response = await requestPromise(options)
            return response.operations[0].response.calendar_days
            // console.log(JSON.stringify(response, null, 4))
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t get calendar for listing ' + id )
            logger.error(e)
        }
    }

    async setHouseManual({token, id, manual} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t get a calendar without a token')
            return null
        } else if(!id) {
            logger.error('Airbnbapi: Can\'t get a calendar without an id')
            return null
        } else if(!manual) {
            logger.error('Airbnbapi: Can\'t get a calendar without a start date')
            return null
        }
        const options = {
            method: 'POST',
            uri: 'https://api.airbnb.com/v1/listings/' + id + '/update',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: this.config.DEFAULT_PARAMETERS,
            body: {
                listing: {house_manual: manual}
            }
        }
        // let response = await requestPromise(options).catch(logger.info)
        try {
            var response = await requestPromise(options)
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t set house manual for listing ' + id )
            logger.error(e)
        } finally {
            return response
        }
    }

    //////////// THREADS SECTION ////////////
    //////////// THREADS SECTION ////////////
    //////////// THREADS SECTION ////////////

    // Gets all the data for one thread
    async getThread({token, id} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t get a thread without a token')
            return null
        } else if(!id) {
            logger.error('Airbnbapi: Can\'t get a thread without an id')
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v1/threads/' + id,
            json: true,
            headers: this.makeAuthHeader(token),
            qs: this.config.DEFAULT_PARAMETERS
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t get thread ' + id )
            logger.error(e)
        } finally {
            return response.thread
        }
    }


    async getMessage({token, id} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t get a thread without a token')
            return null
        } else if(!id) {
            logger.error('Airbnbapi: Can\'t get a thread without an id')
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/messages/' + id,
            json: true,
            headers: this.makeAuthHeader(token),
            qs: this.config.DEFAULT_PARAMETERS
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t get message ' + id )
            logger.error(e)
        } finally {
            return response.thread
        }
    }

    // Gets a list of thread id's for a host
    async getThreads({token, offset = '0', limit = '2'} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t get a thread list without a token')
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
            logger.error('Airbnbapi: Couldn\'t get thread list for token ' + token )
            logger.error(e)
        } finally {
            if(response.threads != undefined) {
                response = response.threads.map(item => item.id)
                return response
            } else return null
        }
    }

    async getReservations({token, offset = '0', limit = '20'} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t get a reservation list without a token')
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/reservations',
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
            logger.error('Airbnbapi: Couldn\'t get reservation list for token ' + token )
            logger.error(e)
        } finally {
            return (response != undefined) ? response.threads : null
        }
    }

    // Similar to getThread but more verbose.
    async getThreadVerbose({token, id} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t get a thread (verbose) without a token')
            return null
        } else if(!id) {
            logger.error('Airbnbapi: Can\'t get a thread (verbose) without an id')
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v1/reservations/relationship',
            json: true,
            headers: this.makeAuthHeader(token),
            qs: Object.assign({}, this.config.DEFAULT_PARAMETERS, {
                    thread_id: id
            })
        }

        try {
            var response = await requestPromise(options)
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t get thread ' + id )
            logger.error(e)
        } finally {
            return response
        }
        // //let response = await requestPromise(options).catch(logger.info)
        // let response = await requestPromise(options).catch(function(error){
        //     console.log(JSON.stringify(error, null, 4))
        // })
        // logger.info(JSON.stringify(response, null, 4))
        // return response
    }

    // Send a message to a thread (guest)
    async sendMessage({token, id, message} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t send a message without a token')
            return null
        } else if(!id) {
            logger.error('Airbnbapi: Can\'t send a message without an id')
            return null
        } else if(!message) {
            logger.error('Airbnbapi: Can\'t send a message without a message body')
            return null
        }
        logger.info('Airbnbapi: send message for thread: ' + id + ' --')
        logger.info('\'' + message.substring(70) + '\'')
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
            logger.error('Airbnbapi: Couldn\'t send message for thread ' + id )
            logger.error(e)
        } finally {
            return response
        }
    }
    // Create a new thread
    async createThread({token, id, checkin, checkout, guestNum='1', message} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t create a thread without a token')
            return null
        } else if(!id) {
            logger.error('Airbnbapi: Can\'t create a thread without an id')
            return null
        } else if(!checkin) {
            logger.error('Airbnbapi: Can\'t create a thread without a checkin')
            return null
        } else if(!checkout) {
            logger.error('Airbnbapi: Can\'t create a thread without a checkout')
            return null
        } else if(!message) {
            logger.error('Airbnbapi: Can\'t create a thread without a message body')
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
            logger.error('Airbnbapi: Couldn\'t send create thread for listing ' + id )
            logger.error(e)
        } finally {
            return response
        }
        // let myError = null
        // let response = await requestPromise(options).catch((error) => {
        //     logger.info(error.error.error_message)
        //     if(error.error.error_message === 'Your request could not be completed because of the following errors: Those dates are not available') {
        //         myError = 'dates'
        //     }
        //     // TODO: More custom feedback.
        // })
        // if(response === undefined && myError != null) {
        //     return myError
        // }
        // return response
    }

    // Send pre-approval to an inquiry
    // requires a id. id, and optional message
    async sendPreApproval({token, thread_id, listing_id, message = ''} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t send pre-approval without a token')
            return null
        } else if(!thread_id) {
            logger.error('Airbnbapi: Can\'t send pre-approval without an id')
            return null
        } else if(!listing_id) {
            logger.error('Airbnbapi: Can\'t send pre-approval without a token')
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
            logger.error('Airbnbapi: Couldn\'t send pre approval for thread  ' + thread_id )
            logger.error(e)
        } finally {
            return response
        }
    }

    async getGuestInfo(id)
    {
        if(!id) {
            logger.error('Airbnbapi: Can\'t get guest info without an id')
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/users/' + id,
            json: true,
            qs: {
                key: this.config.API_KEY,
            }
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t get guest info with user id ' + id )
            logger.error(e)
        } finally {
            return (response && response.user) ? response.user : null
        }
    }

    async getPublicListingCalendar({id, month = '1', year = '2018', count = '1'} = {})
    {
        if(!id) {
            logger.error('Airbnbapi: Can\'t get public listing calendar without an id')
            return null
        }
        const options = {
            method: 'GET',
            uri: 'https://api.airbnb.com/v2/calendar_months',
            json: true,
            qs: {
                key: this.config.API_KEY,
                _format: 'v1_legacy_for_p3',
                listing_id: id,
                month,
                year,
                count,
                _format: 'with_conditions'
            }
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t get public calendar for listing  ' + id )
            logger.error(e)
        } finally {
            return response ? response : null
        }
    }

    async getListingInfo({id} = {})
    {
        if(!id) {
            logger.error('Airbnbapi: Can\'t get public listing information without an id')
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
            logger.error('Airbnbapi: Couldn\'t get info for listing  ' + id )
            logger.error(e)
        } finally {
            return response ? response : null
        }
    }

    async getReservation({token, id} = {}) {
        if(!token) {
            logger.error('Airbnbapi: Can\'t get a reservation without a token')
            return null
        } else if(!thread_id) {
            logger.error('Airbnbapi: Can\'t get a reservation without an id')
            return null
        }
        const options = {
            method: "GET",
            uri: "https://api.airbnb.com/v1/reservations/" + id,
            json: true,
            headers: this.makeAuthHeader(token),
            qs: Object.assign({}, this.config.DEFAULT_PARAMETERS, {
                // none
                })
        }
        try {
            var response = await requestPromise(options)
        } catch (e) {
            logger.error('Airbnbapi: Couldn\'t get reservation for thread ' + id )
            logger.error(e)
        } finally {
            return response ? response : null
        }
    }

    async listingSearch({location='New York, United States', offset=0, limit=20, language='en-US', currency='USD' } = {})
    {
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
            logger.error('Airbnbapi: Couldn\'t get listings for search of ' + location )
            logger.error(e)
        } finally {
            return response ? response : null
        }
    }

    async newAccount({username, password, authenticity_token, firstname, lastname, bdayDay = 1, bdayMonth = 1, bdayYear = 1980 } = {}) {
        if(!username) {
            logger.error('Airbnbapi: Can\'t make a new account without a username')
            return null
        } else if(!password) {
            logger.error('Airbnbapi: Can\'t make a new account without a password')
            return null
        } else if(!authenticity_token) {
            logger.error('Airbnbapi: Can\'t make a new account without an authenticity_token')
            return null
        } else if(!authenticity_token) {
            logger.error('Airbnbapi: Can\'t make a new account without a firstname')
            return null
        } else if(!authenticity_token) {
            logger.error('Airbnbapi: Can\'t make a new account without a lastname')
            return null
        }
        const options = {
            method: 'POST',
            uri: 'https://www.airbnb.com/create/',
            headers: this.config.DEFAULT_HEADER,
            form: {
                authenticity_token,
                'from': 'email_signup',
                'user[email]' : username,
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
            logger.error('Airbnbapi: Couldn\'t make new account for username ' + username )
            logger.error(e)
        } finally {
            return response ? response : null
        }
    }
}

const abba = new AirApi()

module.exports = abba
