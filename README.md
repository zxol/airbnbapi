
# *Unofficial* __airbnb.com__ REST API wrapper for node.js

![](http://eloisecleans.com/blog/wp-content/uploads/2018/02/airbnb-logo-png-logo-black-transparent-airbnb-329-300x300.png)
![](https://cdn2.iconfinder.com/data/icons/nodejs-1/256/nodejs-256.png)

---
Hi there!  
*Disclaimer: this library is not associated with airbnb.com and should only be used for non-profit and educational reasons.*  
This is a pre 1.0 library.  Please request endpoints and functionality as repo issues.  Collaborators wanted!
# Essential Info

- All functions return __promises__  
- Batch functions are limited to 50 elements at a time
- You will need to supply a token for every logged in call
- Error reporting and data validation is weak at this stage!

# Reference

## Contents
1. Authorization
1. Users
1. Calendars
1. Listings
1. Threads
1. Reservations
1. Posting
---
## 1. AUTHORIZATION

### testAuth

Test a token
```javascript
airbnb.testAuth('faketoken3sDdfvtF9if5398j0v5nui')
// returns bool
```
### newAccessToken

Request a new token
```javascript
airbnb.newAccessToken({username:'foo@bar.com', password:'hunter2'})
// returns {token: 'faketoken3sDdfvtF9if5398j0v5nui'} or {error: {error obj}}
```
### login

Request a new token (v2 endpoint).  Similar to the above function but returns a user info summary with much more information.
```javascript
airbnb.login({username:'foo@bar.com', password:'hunter2'})
// returns a user info object (includes token) or {error: {error obj}}
```
TODO: support other login methods
---

## 2. USERS

### getGuestInfo
Get a user's public facing information
```javascript
airbnb.getGuestInfo(2348485493)
// returns public info about user (JSON)
```
### getOwnUserInfo
Obtain user data for the logged in account
```javascript
airbnb.getOwnUserInfo(token)
// returns private info about user (JSON)
```
---

## 3. CALENDARS

### getPublicListingCalendar
Public availability and price data on a listing.  `count` is the duration in months.
```javascript
airbnb.getPublicListingCalendar({
    id: 109834757,
    month: 1,
    year: 2018,
    count: 1  
})
// returns array of calendar days, with availability and price
```
### getCalendar
Private calendar data regarding your listings.  Reservations, cancellations, prices, blocked days.
```javascript
airbnb.getCalendar({
        token: 'faketoken3sDdfvtF9if5398j0v5nui',
        id: 109834757,
        startDate: '2018-01-01',
        endDate: '2018-02-28',
})
// returns array of calendar days with extended info, for your listings
```
### setPriceForDay
Set a price for a day.
```javascript
airbnb.setPriceForDay({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757,
    date: '2018-01-01',
    price: 1203,
})
// returns a result of the operation
```
### setAvailabilityForDay
Set availability for a day.
```javascript
airbnb.setAvailabilityForDay({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757,
    date: '2018-01-01',
    availability: 'available', // or 'blocked'?
})
// returns a result of the operation
```
---

## 4. LISTINGS

### listingSearch
Airbnb's mighty search bar in JSON form.  More options coming soon.
```javascript
airbnb.listingSearch({
    location: 'New York, United States',
    offset: 0,
    limit: 20,
    language: 'en-US',
    currency: 'USD'
})
// returns an array of listings
```
### getListingInfo
Gets public facing data on any listing.
```javascript
airbnb.getListingInfo({id: 109834757})
// returns public info for any listing (JSON)
```
### getListingInfoHost
Gets private data on one of your listings.
```javascript
airbnb.getListingInfoHost({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757
})
// returns extended listing info for your listing (JSON)
```
---

## 5. THREADS

### getThread
Returns a conversation with a guest or host.  This is a legacy endpoint which is somewhat limited in the content (only basic messages are reported in the 'posts' array)
```javascript
airbnb.getThread({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 909878797
})
// returns a single thread in the legacy format (JSON)
```
### getThreads
A simple list of thread ID's, ordered by latest update.  The offset is how many to skip, and the limit is how many to report.
```javascript
airbnb.getThreads({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    offset: 0,
    limit: 20
})
// returns an array of thread IDS (only the ids, ordered by latest update) (JSON)
```

### getThreadsFull
This is the best way to pull thread data. Returns an array of full thread data, ordered by latest update.  The `offset` is how many to skip, and the `limit` is how many to report.
```javascript
airbnb.getThreadsFull({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    offset: 0,
    limit: 10
})
// returns an array of threads in the new format, ordered by latest update (JSON)
```
### getThreadsBatch

A batch version of the above. You can grab a collection of threads referenced by thread ID.
```javascript
airbnb.getThreadsBatch({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    ids: [23049848, 203495875, 398328244]
})
// returns an array of threads in the new format (JSON)
```
---

## 6. RESERVATIONS

### getReservation
Reservation data for one reservation.
```javascript
airbnb.getReservation({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 909878797
})
// returns a single reservation in the mobile app format (JSON)
```
### getReservations

Returns a list of reservations in the same format as above, ordered by latest update
```javascript
airbnb.getReservations({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    offset: 0,
    limit: 10
})
// returns an array of reservations in the mobile app format, ordered by latest update (JSON)
```
### getReservationsBatch

Batch call for grabbing a list of reservations by ID.
```javascript
airbnb.getReservationsBatch({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    ids: [98769876, 98769543, 98756745]
})
// returns an array of reservations in the new format (JSON)
```
---

## 7. POSTING

### sendMessage
Send a message to a thread.
```javascript
airbnb.sendMessage({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 2039448789,
    message: 'Hi there!'
})
// returns confirmation
```
### sendPreApproval
Send a pre-approval to a guest.
```javascript
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
```javascript
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
```javascript
airbnb.sendSpecialOffer({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    check_in: "2018-10-13T00:00:00+00:00",
	guests: 1,
	listing_id: 9876676,
	nights: 1,
	price: 100000,
	thread_id: 98766767,
    currency: 'USD'
})
// returns confirmation
```
