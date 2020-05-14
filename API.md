# Wheel Deal API Guide

## Account-related routes

### POST /api/users
Used to create a new account
#### Response Codes:
400: Username, password, full name, or phone number is not provided
403: Not logged out, or username/phone number already in use
200: Successfully created account

### GET /api/users/current
Used to get current logged in user
#### Response Codes:
401: Not logged in
200: Successfully retrieved user

### POST /api/users/signin
Used to signin to an existing account
#### Response Codes:
400: No username or password provided
403: Already logged in
404: User not found
401: User and password combination invalid
200: Successful login

### POST /api/users/signout
Used to signout of an existing account
#### Response Codes:
404: Not logged in
200: Successful logout

### GET /api/users/account/balance
Used to get balance for an existing account
#### Response Codes:
401: Not logged in
200: Successfully retrieved balance

### PUT /api/users/account/balance
Used to update balance for an existing account
#### Response Codes:
401: Not logged in
400: No amount provided
200: Successfully updated balance

### POST /api/users/account/balance/transfer
Used to transfer an amount to another user from an existing account
#### Response Codes:
401: Not logged in
400: No amount provided
200: Successfully transfered amount

## Bike-related routes

### GET /api/bikes
Used to get all bikes
#### Response Codes:
200: Successfully retrieved all bikes

### GET /api/bikes/location
Used to list all bikes within a 0.2 degree radius of specified coordinates
#### Response Codes:
200: Successfully retrieved bikes
400: latitude, longitude is not specified
403: latitude, longitude is not valid

### GET /api/bikes/bike/:id/unavailability
Used to get days when a bike is not available
#### Response Codes:
200: Successfully retrieved unavailability
400: No bike id provided
404: Bike not found

### GET /api/bikes/bike/:id/available
Used to get days when a bike is available
#### Response Codes:
200: Successfully retrieved availability
400: No bike id provided
404: Bike not found

### PUT /api/bikes/bike/:id/available
Used to update the availability of a bike
#### Response Codes:
200: Successfully updated availability
400: No bike id provided or start time, end time is not specified
404: Bike not found
403: start time, end time is not valid

### GET /api/bikes/availability
Used to list all bikes available during specified window of time
#### Response Codes:
200: Successfully retrieved bikes
400: start time, end time is not specified
403: start time, end time is not valid

### GET /api/bikes/search
Used to list all bikes within a 0.2 degree radius of specified coordinates, and available during specified window of time
#### Response Codes:
200: Successfully retrieved bikes
400: latitude, longitude, start time, end time is not specified
403: latitude, longitude, start time, end time is not valid

### GET /api/bikes/bike/:id/damageFee
Used to get a bike's damage fee
#### Response Codes:
200: Successfully retrieved damage fee
400: No bike id provided
404: Bike not found

### POST /api/bikes
Used to create a new bike
#### Response Codes:
400: Price, latitude, longitude, startTime, endTime is not specified
401: User is not logged in
200: Successfully created bike

### PUT /api/bikes/bike/:id
Used to edit a bike
#### Response Codes:
400: Bike id is not specified or nothing has been provided to change
401: User is not logged in or user is not creator of bike
403: Field(s) to change is not valid
404: Bike does not exist
200: Successfully edited bike

### PUT /api/bikes/bike/:id/price
Used to edit a bike's price
#### Response Codes:
400: Bike id is not specified or nothing has been provided to change
401: User is not logged in or user is not creator of bike
404: Bike does not exist
200: Successfully edited bike price

### PUT /api/bikes/bike/:id/location
Used to edit a bike's location
#### Response Codes:
400: Bike id is not specified or nothing has been provided to change
401: User is not logged in or user is not creator of bike
403: Field(s) to change is not valid
404: Bike does not exist
200: Successfully edited bike location

### PUT /api/bikes/bike/:id/availability
Used to edit a bike's availability
#### Response Codes:
400: Bike id is not specified or nothing has been provided to change
401: User is not logged in or user is not creator of bike
404: Bike does not exist
200: Successfully edited bike availability

### DELETE /api/bikes/:id
Used to delete a bike
#### Response Codes:
400: Bike id is not specified
401: User is not logged in or user is not creator of bike
404: Bike does not exist
200: Successfully deleted bike

## Ride-related routes

### GET /api/rides
Used to get all rides for a logged in user
#### Response Codes:
401: Not logged in
200: Successfully retrieved all rides for user

### GET /api/rides/own
Used to get all rides for which a user is the bike owner
#### Response Codes:
401: Not logged in
200: Successfully retrieved all rides for user

### POST /api/rides
Used to create a ride
#### Response Codes:
401: Not logged in
404: Bike used for ride does not exist
200: Successfully created ride

### PUT /api/rides/cancel/:id
Used to cancel a ride
#### Response Codes:
401: User is not logged in or is not rider
404: Ride does not exist
409: Ride is not reserved or active
200: Successfully cancelled ride

### PUT /api/rides/stolen/:id
Used to mark a ride as stolen
#### Response Codes:
401: User is not logged in or is not owner
404: Ride does not exist
409: Ride is not riding or finished
200: Successfully marked ride as stolen

### PUT /api/rides/arrived/:id
Used to mark a ride as arrived
#### Response Codes:
401: User is not logged in or is not rider
404: Ride does not exist
409: Ride is not reserved
200: Successfully marked ride as arrived

### PUT /api/rides/confirm/:id
Used to mark a ride as confirmed
#### Response Codes:
401: User is not logged in or is not owner
404: Ride does not exist
409: Ride is not arrived
200: Successfully marked ride as confirmed

### PUT /api/rides/finished/:id
Used to mark a ride as finished
#### Response Codes:
401: User is not logged in or is not rider
404: Ride does not exist
409: Ride is not riding
200: Successfully marked ride as finished

### PUT /api/rides/returned/:id
Used to mark a ride as returned
#### Response Codes:
401: User is not logged in or is not owner
404: Ride does not exist
409: Ride is not finished
200: Successfully marked ride as returned

### PUT /api/rides/reviewed/:id
Used to mark a ride as reviewed
#### Response Codes:
401: User is not logged in or is not rider
404: Ride does not exist
409: Ride is not returned
200: Successfully marked ride as reviewed

## Review-related routes

### GET /api/reviews/by/:reviewer
Used to get all reviews for a certain reviewer
#### Response Codes:
400: Reviewer is not specified
404: Reviewer does not exist
200: Successfully retrieved reviews

### GET /api/reviews/for/:entity
Used to get all reviews for a certain entity
#### Response Codes:
400: Entity is not specified
404: Entity does not exist
200: Successfully retrieved reviews

### GET /api/reviews/:entity/rating
Used to compute overall rating for entity
#### Response Codes:
400: Entity is not specified
404: Entity does not exist
200: Successfully retrieved rating

### POST /api/reviews
Used to create a review
#### Response Codes:
400: Recipient id, rating, comment is not specified
401: User is not logged in
403: User is writing review for self
404: Entity with recipient id does not exist
200: Successfully created review

### PUT /api/reviews/review/:id
Used to edit a review
#### Response Codes:
400: Id, rating, comment is not specified
401: User is not logged in or user is not the creator of the review
403: Id, rating is not valid
404: Review does not exist
200: Successfully edited review

### DELETE /api/reviews/:id
Used to delete a review
#### Response Codes:
400: Id is not specified
401: User is not logged in or user is not the creator of the review
404: Review does not exist
200: Successfully deleted review
