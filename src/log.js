const LOGLEVEL = process.env.LOGLEVEL || 'none'
const log = {
    i: obj => {
        if (LOGLEVEL === 'info' || LOGLEVEL === 'error' || LOGLEVEL === 'debug') {
            console.log(obj)
        }
    },
    e: obj => {
        if (LOGLEVEL === 'info' || LOGLEVEL === 'error') {
            console.error(obj)
        }
    },
    d: obj => {
        if (LOGLEVEL === 'debug') {
            console.error(obj)
        }
    }
}
export default log
