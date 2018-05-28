'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
const LOGLEVEL = process.env.LOGLEVEL || 'none';
const log = {
    i: obj => {
        if (LOGLEVEL === 'info' || LOGLEVEL === 'error' || LOGLEVEL === 'debug') {
            console.log(obj);
        }
    },
    e: obj => {
        if (LOGLEVEL === 'info' || LOGLEVEL === 'error') {
            console.error(obj);
        }
    },
    d: obj => {
        if (LOGLEVEL === 'debug') {
            console.error(obj);
        }
    }
};
exports.default = log;