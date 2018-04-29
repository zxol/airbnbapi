require('dotenv').config()
process.env.NODE_ENV = 'test'
let abba = require('../index.js')
let chai = require('chai')
let nock = require('nock')
let _ = require('lodash')
let {assert, should, expect} = chai

const apiBaseUrl = 'https://api.airbnb.com'

const allBut = str =>  new Regexp('^(?!.*'+str+')')

describe('airbnbapi', () => {
    describe('#makeAuthHeader(token)', () => {

        it('should return null if a token is not present', () => {
            expect(abba.makeAuthHeader()).to.be.null
        })
        it('should return type object', () => {
            expect(abba.makeAuthHeader('z')).to.be.an('object')
        })
        it('return object should have property [content-type]', () => {
            expect(abba.makeAuthHeader('z')).to.have.property('Content-Type')
        })
        it('return object should have property [X-Airbnb-OAuth-Token]', () => {
            expect(abba.makeAuthHeader('z')).to.have.property('X-Airbnb-OAuth-Token')
        })
        it('return object should have property [User-Agent]', () => {
            expect(abba.makeAuthHeader('z')).to.have.property('User-Agent')
        })
    })

    describe('#testAuth(token)', () => {

        // Mock endpoint: invalid token
        nock(apiBaseUrl)
        .persist()
        .matchHeader('X-Airbnb-OAuth-Token', allBut('mockcorrecttoken')) //anything but regex
        .post('/v2/batch', {operations:[]})
        .query(true)
        .reply(400, {"error": " mock unauthorized"})

        // Mock endpoint: valid token 'mockcorrecttoken'
        nock(apiBaseUrl)
        .matchHeader('X-Airbnb-OAuth-Token', 'mockcorrecttoken')
        .post('/v2/batch', {operations: []} )
        .query(true)
        .reply(200, {operations:[]})

        it('should return null if a token is not present', async () => {
            expect(await abba.testAuth()).to.be.null
        })
        it('should return false for incorrect token', async () => {
            expect(await abba.testAuth('z')).to.be.false
        })
        it('should return true for correct token', async () => {
            expect(await abba.testAuth('mockcorrecttoken')).to.be.true
        })
    })

    describe('#newAccessToken({username, password})', () => {
        // Mock endpoint: invalid info
        nock(apiBaseUrl)
        .persist()
        .post('/v1/authorize', {
            grant_type: 'password',
            username: 'mockuser',
            password: 'mockpass'
        })
        .query(true)
        .reply(400, {"error": " mock invalid"})

        // Mock endpoint: valid info 'mockuser'. 'mockpass'
        nock(apiBaseUrl)
        .post('/v1/authorize', {
            grant_type: 'password',
            username: 'mockuser',
            password: 'mockpass'
        })
        .query(true)
        .reply(200, {token:'mocktoken'})

        it('should return null if no input present', async () => {
            expect(await abba.newAccessToken()).to.be.null
        })
        it('should return null if username is not present', async () => {
            expect(await abba.newAccessToken({password: 'asdf'})).to.be.null
        })
        it('should return null if password is not present', async () => {
            expect(await abba.newAccessToken({username: 'asdf'})).to.be.null
        })
        it('should return null if login details are incorrect', async () => {
            expect(await abba.newAccessToken({username: 'asdf', password: 'bbb'})).to.be.null
        })
        it('should return the token if the login details are correct', async () => {
            expect(await abba.newAccessToken({username: 'mockuser', password: 'mockpass' })).to.be.a('string')
        })
    })

    describe('#getCalendar({token, id, startDate, endDate} = {})', () => {
        it('should return null if no input present', async () => {
            expect(await abba.getCalendar()).to.be.null
        })
        it('should return null if token, id, startDate or endDate is not present', async () => {
            expect(await abba.getCalendar({id:process.env.TEST_HOST_LISTING_ID, startDate:'2017/11/01', endDate:'2017/12/01'})).to.be.null
            expect(await abba.getCalendar({token: process.env.TEST_HOST_TOKEN, startDate:'2017/11/01', endDate:'2017/12/01'})).to.be.null
            expect(await abba.getCalendar({token: process.env.TEST_HOST_TOKEN, id:process.env.TEST_HOST_LISTING_ID, endDate:'2017/12/01'})).to.be.null
            expect(await abba.getCalendar({token: process.env.TEST_HOST_TOKEN, id:process.env.TEST_HOST_LISTING_ID, startDate:'2017/11/01'})).to.be.null
        })
        it('should return type object', async () => {
            expect(await abba.getCalendar({token: process.env.TEST_HOST_TOKEN, id:process.env.TEST_HOST_LISTING_ID, startDate:'2017-11-01', endDate:'2017-12-01'})).to.be.an('object')
        })
    })
})
