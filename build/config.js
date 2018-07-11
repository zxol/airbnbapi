'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
const config = {
    domain: 'https://api.airbnb.com',
    api_key: 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
    default_headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        // 'User-Agent': 'Mozillaz/5.0 (Windows NT 6.1)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
        // 'User-Agent': 'TESTING API'
        // 'User-Agent': randomUseragent.getRandom()
    },
    currency: 'JPY',
    proxy: undefined
};
exports.default = config;