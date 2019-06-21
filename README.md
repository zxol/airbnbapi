## Breaking changes ahead!

Version 0.11.0, due to be released sometime after July 1st. Errors will no longer return null values. Instead, errors will be thrown.

# _Unofficial_ **airbnb.com** REST API wrapper for node.js

![](http://eloisecleans.com/blog/wp-content/uploads/2018/02/airbnb-logo-png-logo-black-transparent-airbnb-329-300x300.png)
![](https://cdn2.iconfinder.com/data/icons/nodejs-1/256/nodejs-256.png)  
![](https://travis-ci.org/zxol/airbnbapi.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/zxol/airbnbapi/badge.svg?branch=master)](https://coveralls.io/github/zxol/airbnbapi?branch=master)

---

Hi there! 👋 This is a javascript library for interacting with airbnb's API.  
_Disclaimer: this library is not associated with airbnb and should only be used for educational reasons. It is an interface for a private API used by airbnb's mobile applications._  
This is a pre 1.0 library. Please request endpoints and functionality as repo issues. Collaborators wanted!

# Essential Info

-   All functions return [**promises**.](https://github.com/wbinnssmith/awesome-promises)
-   The returned data format is pre-parsed JSON, i.e. a javascript object. Multiple records will be returned as an array.
-   The auth system is a simple crypto token. For the uninitiated, this is like a username and password in one. If you're only using a single account, you can supply a token with `.setDefaultToken()`, otherwise, you will have to supply a token with every function call.
-   Yeah, I know, airlock is a massive pain in the posterior.
-   Error reporting and data validation is spotty at this stage!
-   This library only has one dependency - request-promise.

# Getting started 👨‍💻

## Installing

```
npm install airbnbapijs
```

## Importing

```
var airbnb = require('airbnbapijs')
```

or es6...

```
import airbnb from 'airbnbapijs'
```

# Reference 📗

## Contents

1. Authorization
1. Users
1. Calendars
1. Listings
1. Threads
1. Reservations
1. Posting
1. Configuration

---

## AUTHORIZATION

### testAuth

Test a token

```js
airbnb.testAuth('faketoken3sDdfvtF9if5398j0v5nui')
// returns bool
```

### newAccessToken

Request a new token

```js
airbnb.newAccessToken({ username: 'foo@bar.com', password: 'hunter2' })
// returns {token: 'faketoken3sDdfvtF9if5398j0v5nui'} or {error: {error obj}}
```

### login

Request a new token (v2 endpoint). Similar to the above function but returns a user info summary with much more information.

```js
airbnb.login({ username: 'foo@bar.com', password: 'hunter2' })
// returns a user info object (includes token) or {error: {error obj}}
```

### setDefaultToken

Set the token to use if a token is not supplied for an endpoint function.

```js
airbnb.setDefaultToken('faketoken3sDdfvtF9if5398j0v5nui')
```

TODO: support other login methods (facebook, twitter, etc...)

---

## USERS

### getGuestInfo

Get a user's public facing information

```js
airbnb.getGuestInfo(2348485493)
// returns public info about user (JSON)
```

### getOwnUserInfo

Obtain user data for the logged in account

```js
airbnb.getOwnUserInfo('faketoken3sDdfvtF9if5398j0v5nui')
// returns private info about user (JSON)
```

---

## CALENDARS

### getPublicListingCalendar

Public availability and price data on a listing. `count` is the duration in months.

```js
airbnb.getPublicListingCalendar({
    id: 109834757,
    month: 1,
    year: 2018,
    count: 1
})
// returns array of calendar days, with availability and price
```

### getCalendar

Private calendar data regarding your listings. Reservations, cancellations, prices, blocked days.

```js
airbnb.getCalendar({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757,
    startDate: '2018-01-01',
    endDate: '2018-02-28'
})
// returns array of calendar days with extended info, for your listings
```

### setPriceForDay

Set a price for a day.

```js
airbnb.setPriceForDay({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757,
    date: '2018-01-01',
    price: 1203
})
// returns a result of the operation
```

### setAvailabilityForDay

Set availability for a day.

```js
airbnb.setAvailabilityForDay({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757,
    date: '2018-01-01',
    availability: 'available' // or 'blocked'?
})
// returns a result of the operation
```

---

## LISTINGS

### listingSearch

Airbnb's mighty search bar in JSON form. All arguments are optional.

```js
airbnb.listingSearch({
    location: 'Akihabara, Tokyo',
    checkin: '2020-01-21',
    checkout: '2020-02-10',
    offset: 0,
    limit: 20,
    language: 'en-US',
    currency: 'USD',
    guests: 6, // Number of guests for price quote
    instantBook: true, // only list instant bookable listings.
    minBathrooms: 0,
    minBedrooms: 2,
    minBeds: 6,
    minPrice: 0,
    maxPrice: 0,
    superhost: true,
    amenities: [1, 2, 4, 23], // array of IDs.
    hostLanguages: [1, 3, 6], // array of IDs.
    keywords: 'ocean view,garden,quiet', //comma separated
    roomTypes: ['Entire home/apt', 'Private room', 'Shared room'],
    neighborhoods: ['westside', 'riverside'],
    minPicCount: 4,
    sortDirection: 1 // 1 = forward, 0 = reverse
})
// returns an array of listings
```

### getListingInfo

Gets public facing data on any listing.

```js
airbnb.getListingInfo(109834757)
// returns public info for any listing (JSON)
```

### getListingInfoHost

Gets private data on one of your listings.

```js
airbnb.getListingInfoHost({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757
})
// returns extended listing info for your listing (JSON)
```

### getHostSummary

Gets an object containing a host's active listings, alerts, and upcoming reservations

```js
airbnb.getHostSummary('faketoken3sDdfvtF9if5398j0v5nui')
// returns host summary info for your account (JSON)
```

### getOwnActiveListings

Gets an array containing a host's active listings

```js
airbnb.getOwnActiveListings('faketoken3sDdfvtF9if5398j0v5nui')
// returns listing array for your account (JSON)
```

---

### getOwnListings

Gets an array containing a host's listings

```js
airbnb.getOwnListings({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    userId: '2344594'
})
// returns listing array for your account (JSON)
```

---

## THREADS

### getThread

Returns a conversation with a guest or host. This is a legacy endpoint which is somewhat limited in the content (only basic messages are reported in the 'posts' array)

```js
airbnb.getThread({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 909878797
})
// returns a single thread in the legacy format (JSON)
```

### getThreads

A simple list of thread ID's, ordered by latest update. The offset is how many to skip, and the limit is how many to report.

```js
airbnb.getThreads({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    offset: 0,
    limit: 20
})
// returns an array of thread IDS (only the ids, ordered by latest update) (JSON)
```

### getThreadsFull

This is the best way to pull thread data. Returns an array of full thread data, ordered by latest update. The `offset` is how many to skip, and the `limit` is how many to report.

```js
airbnb.getThreadsFull({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    offset: 0,
    limit: 10
})
// returns an array of threads in the new format, ordered by latest update (JSON)
```

### getThreadsBatch

A batch version of the above. You can grab a collection of threads referenced by thread ID.

```js
airbnb.getThreadsBatch({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    ids: [23049848, 203495875, 398328244]
})
// returns an array of threads in the new format (JSON)
```

---

## RESERVATIONS

### getReservation

Reservation data for one reservation.

```js
airbnb.getReservation({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 909878797
})
// returns a single reservation in the mobile app format (JSON)
```

### getReservations

Returns a list of reservations in the same format as above, ordered by latest update

```js
airbnb.getReservations({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    offset: 0,
    limit: 10
})
// returns an array of reservations in the mobile app format, ordered by latest update (JSON)
```

### getReservationsBatch

Batch call for grabbing a list of reservations by ID.

```js
airbnb.getReservationsBatch({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    ids: [98769876, 98769543, 98756745]
})
// returns an array of reservations in the new format (JSON)
```

---

## POSTING

### sendMessage

Send a message to a thread.

```js
airbnb.sendMessage({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 2039448789,
    message: 'Hi there!'
})
// returns confirmation
```

### sendPreApproval

Send a pre-approval to a guest.

```js
airbnb.sendPreApproval({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    thread_id: 2039448789,
    listing_id: 340598483,
    message: ''
})
// returns confirmation
```

### sendReview

Send a review to a guest after they have checked out. (`id` is the thread id)

```js
airbnb.sendReview({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 2039448789,
    comments: 'They were great guests!',
    private_feedback: 'Thank you for staying!',
    cleanliness: 5,
    communication: 5,
    respect_house_rules: 5,
    recommend: true
})
// returns confirmation
```

### sendSpecialOffer

Send a special offer to a guest.

```js
airbnb.sendSpecialOffer({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    check_in: '2018-10-13T00:00:00+00:00',
    guests: 1,
    listing_id: 9876676,
    nights: 1,
    price: 100000,
    thread_id: 98766767,
    currency: 'USD'
})
// returns confirmation
```

### alterationRequestResponse

Send a "reservation alteration request response" to a guest  
To accept the request, supply the `decision` prop with `true`  
To decline the request, supply the `decision` prop with `false`

```js
alterationRequestResponse({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    reservationId: 23049459,
    alterationId: 2134094,
    decision: true,
    currency: 'USD'
})
// returns alteration object, or an error object.
```

## CONFIGURATION

### setConfig

Set multiple config variables at once

```js
setConfig({
    defaultToken: 'faketoken3sDdfvtF9if5398j0v5nui',
    apiKey: '01123581321345589144233377610987',
    currency: 'USD',
    userAgent: 'Mosaic/0.9',
    proxy: 'myproxy.com'
})
```

### setDefaultToken

Set the token to use if a token is not supplied for an endpoint function.

```js
airbnb.setDefaultToken('faketoken3sDdfvtF9if5398j0v5nui')
```

### setApiKey

Use an api key different from the standard one

```js
airbnb.setApiKey('01123581321345589144233377610987')
```

### setCurrency

Set the default [currency](https://www.iban.com/currency-codes.html) (the default is JPY, sorry USA)

```js
airbnb.setCurrency('USD')
```

### setUserAgent

set the user agent string for the requests

```js
airbnb.setUserAgent('Mosaic/0.9')
```

### setProxy

set a proxy server to run traffic through

```js
airbnb.setProxy('myproxy.com')
```
