# AirBnbApi

An unofficial (partial) interface for the Airbnb.com API, for Node.js
Please note this is only a subset of available endpoints, based on information publically available.
It does contain more endpoints than other libs on github.

## Getting started

Install the npm package to your project via npm with the command:
```
npm install --save airbnbapi
```
to import the interface in your node project:
```
var airbnbapi = require('airbnbapi')
```
or if you're down with es6:
```
import airbnbapi from 'airbnbapi'
```

Some of the endpoints for this API are logged in only endpoints (i.e. authenticated endpoints).  
You will need to provide an access token with every function call to receive a response.
The interface was designed this way (supply a token each time) so you can write code for more than one account at a time, using the same interface object. It's kind of FP flavor, but not really, because we're accessing a network api.

## Available Commands

### Public Endpoints (No auth needed. No rate limiting):

#### New Access Token

Return an access token (string), given email login details. Required to query authenticated endpoints.
```
airbnbapi.newAccessToken({username, password})
```

Example (babel):
```
const token = await airbnbapi.newAccessToken({username: "mkusunagi@s9.co", password: "LocusSolus"})
```

Example output:
```
8hwt35c4v11ao338r0zvbrw1s
```

#### Get user ID

Return an access token, given email login details.
```
airbnbapi.newAccessToken({username, password})
```

### Private Endpoints (Logged in, authenticated endpoints. Rate limited.):

Test Auth - Returns true if the token is valid.  Useful for checking a token's validity.
```
airbnbapi.testAuth(token)
```

// TODO: add more

Get Calendar - Returns host calendar data for a host's own listing,
```
airbnbapi.getCalendar({token, id, startDate, endDate})
```
