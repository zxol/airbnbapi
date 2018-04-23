all functions return promises
batch functions are limited to 50 elements at a time

### AUTH
```
airbnb.testAuth('faketoken3sDdfvtF9if5398j0v5nui')
// returns bool

airbnb.newAccessToken({username:'foo@bar.com', password:'hunter2'})
// returns {token: 'faketoken3sDdfvtF9if5398j0v5nui'} or {error: {error obj}}
```

### USERS
```
airbnb.getGuestInfo(2348485493)
// returns public info about user (JSON)

airbnb.getOwnUserInfo(token)
// returns private info about user (JSON)
```

### CALENDAR
```
airbnb.getPublicListingCalendar({
    id: 109834757,
    month: 1,
    year: 2018,
    count: 1  
})
// returns array of calendar days, with availability and price

airbnb.getCalendar({
        token: 'faketoken3sDdfvtF9if5398j0v5nui',
        id: 109834757,
        startDate: '2018-01-01',
        endDate: '2018-02-28',
})
// returns array of calendar days with extended info, for your listings

airbnb.setPriceForDay({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757,
    date: '2018-01-01',
    price: 1203,
})
// returns a result of the operation

airbnb.setAvailabilityForDay({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757,
    date: '2018-01-01',
    availability: 'available', // or 'blocked'?
})
// returns a result of the operation
```

### LISTING
```
airbnb.getListingInfo({id: 109834757})
// returns public info for any listing (JSON)

airbnb.getListingInfoHost({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 109834757
})
// returns extended listing info for your listing (JSON)
```

### THREADS
```
airbnb.getThread({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 909878797
})
// returns a single thread in the legacy format (JSON)

airbnb.getThreads({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    offset: 0,
    limit: 2
})
// returns an array of thread IDS (only the ids, ordered by latest update) (JSON)

airbnb.getThreadsFull({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    offset: 0,
    limit: 2
})
// returns an array of threads in the new format, ordered by latest update (JSON)

airbnb.getThreadsBatch({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    ids: [23049848, 203495875, 398328244]
})
// returns an array of threads in the new format (JSON)
```

### RESERVATIONS
```
airbnb.getReservation({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 909878797
})
// returns a single reservation in the mobile app format (JSON)

airbnb.getReservations({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    offset: 0,
    limit: 10
})
// returns an array of reservations in the mobile app format, ordered by latest update (JSON)

airbnb.getReservationsBatch({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    ids: [98769876, 98769543, 98756745]
})
// returns an array of reservations in the new format (JSON)
```
### POSTING
```
airbnb.sendPreApproval({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    thread_id: 2039448789,
    listing_id: 340598483,
    message: ''
})
// returns confirmation

airbnb.sendMessage({
    token: 'faketoken3sDdfvtF9if5398j0v5nui',
    id: 2039448789,
    message: 'Hi there!'
})
// returns confirmation

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
