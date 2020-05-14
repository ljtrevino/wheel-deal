const express = require('express');

const Rides = require('../models/Rides');
const Bikes = require('../models/Bikes');

const router = express.Router();

/**
 * List all rides for the account.
 * @name GET/api/rides
 * @return {Ride[]} - list of rides
 */
router.get('/', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to view your rides.',
    }).end();
  } else {
	const rides = await Rides.getRidesForUser(req.session.username);
  res.status(200).json(rides);
  }
});

/**
 * List all rides for bikes that the account owns.
 * @name GET/api/rides/own
 * @return {Ride[]} - list of rides
 */
router.get('/own', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to view the rides you own.',
    }).end();
  } else {
	const rides = await Rides.getRidesForOwner(req.session.username);
  res.status(200).json(rides);
  }
});

/**
 * Create a ride.
 * @name POST/api/rides
 * @param {string} bikeId - bike id
 * @return {Ride} - the created ride
 * @throws {401} - if user is not logged in
 * @throws {404} - if bike used for ride is not found
 */
router.post('/', (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to create a ride.',
    }).end();
  } else {
  	if (Bikes.isValidBikeId(req.body.bikeId)) {
      Rides.create(
        req.session.username,
        req.body.bikeId,
        req.body.start,
        req.body.end
      );
      Bikes.removeAvailability(
        req.body.bikeId,
        req.body.start,
        req.body.end
      );
  		res.status(200).send('Reservation has been successful.').end();
  	} else {
  		res.status(404).send("Could not find a bike with id: " + req.body.bikeId).end();
  	}
  }
});

/**
 * Cancel a ride.
 * @name PUT/api/rides/cancel
 * @param {string} bike_id - bike id
 * @return {string} - confirmation
 * @throws {401} - if user is not logged in
 * @throws {404} - if ride is not found
 * @throws {409} - if ride is not active
 */
router.put('/cancel/:id', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to cancel a ride.',
    }).end();
  } else {
    rideData = await Rides.getRideForID(req.params.id);
    ride = rideData[0];
    if (ride === undefined) {
    	res.status(404).send("Could not find a ride with id: " + req.params.id).end();
    } else if (ride.user !== req.session.username) {
    	res.status(401).send("Cannot cancel another user's ride.").end();
    } else {
    	if (ride.status === "reserved" || ride.status === "arrived") {
			  Rides.cancelRide(req.params.id);
	    	res.status(200).send("Ride cancelled.").end();
	    } else {
	    	res.status(409).send("Ride must be active to be cancelled.")
	    }
    }
  }
});

/**
 * Mark a ride stolen
 * @name PUT/api/rides/stolen
 * @param {string} bike_id - bike id
 * @return {string} - confirmation
 * @throws {401} - if user is not logged in or user isn't bike owner
 * @throws {404} - if ride is not found
 * @throws {409} - if rider didn't arrive at the bike yet
 */
router.put('/stolen/:id', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to mark a ride stolen.',
    }).end();
  } else {
    rideData = await Rides.getRideForID(req.params.id);
    ride = rideData[0];
    if (ride === undefined) {
      res.status(404).send("Could not find a ride with id: " + req.params.id).end();
    } else {
      bike = await Bikes.findOne(ride.bikeid);
      if (bike.owner !== req.session.username) {
        res.status(401).send("Cannot mark a bike stolen for a bike you don't own.").end();
      } else {
        if (ride.status === "riding" || ride.status === "finished") {
          Rides.stolenRide(req.params.id);
          res.status(200).send("Ride marked stolen.").end();
        } else {
          res.status(409).send("Rider must not have returned the bike.")
        }
      }
    }
  }
});

/**
 * Change ride status to "arrived" - rider is at the bike
 * @name PUT/api/rides/:id/arrived
 * @param {string} bike_id - bike id
 * @return {string} - confirmation
 * @throws {401} - if user is not logged in or wrong user
 * @throws {404} - if ride is not found
 * @throws {409} - if ride is not reserved
 */
router.put('/arrived/:id', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to use a ride.',
    }).end();
  } else {
  	rideData = await Rides.getRideForID(req.params.id);
    ride = rideData[0];
    if (ride === undefined) {
    	res.status(404).send("Could not find a ride with id: " + req.params.id).end();
    } else if (ride.user !== req.session.username) {
    	res.status(401).send("Cannot use another user's ride.").end();
    } else {
    	if (ride.status === "reserved") {
	    	Rides.advanceRideStatus(req.params.id);
	    	res.status(200).send("Ride pick up started.").end();
	    } else {
	    	res.status(409).send("Ride must be reserved to start.")
	    }
    }
  }
});

/**
 * Change ride status to "riding" - owner confirmed bike exchange
 * @name PUT/api/rides/confirm
 * @param {string} bike_id - bike id
 * @return {string} - confirmation
 * @throws {401} - if user is not logged in or user isn't bike owner
 * @throws {404} - if ride is not found
 * @throws {409} - if rider didn't arrive at the bike yet
 */
router.put('/confirm/:id', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to use a ride.',
    }).end();
  } else {
  	rideData = await Rides.getRideForID(req.params.id);
    ride = rideData[0];
    if (ride === undefined) {
    	res.status(404).send("Could not find a ride with id: " + req.params.id).end();
    } else {
      bike = await Bikes.findOne(ride.bikeid);
      if (bike.owner !== req.session.username) {
        res.status(401).send("Cannot confirm bike pickup for a bike you don't own.").end();
      } else {
        if (ride.status === "arrived") {
          Rides.advanceRideStatus(req.params.id);
          res.status(200).send("Ride started.").end();
        } else {
          res.status(409).send("Rider must be at the bike to confirm.")
        }
      }
    }
  }
});

/**
 * Change ride status to "finished" - rider returned the bike
 * @name PUT/api/rides/finished
 * @param {string} bike_id - bike id
 * @return {string} - confirmation
 * @throws {401} - if user is not logged in or wrong user
 * @throws {404} - if ride is not found
 * @throws {409} - if ride wasn't started
 */
router.put('/finished/:id', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to use a ride.',
    }).end();
  } else {
  	rideData = await Rides.getRideForID(req.params.id);
    ride = rideData[0];
    if (ride === undefined) {
    	res.status(404).send("Could not find a ride with id: " + req.params.id).end();
    } else if (ride.user !== req.session.username) {
    	res.status(401).send("Cannot use another user's ride.").end();
    } else {
    	if (ride.status === "riding") {
	    	Rides.advanceRideStatus(req.params.id);
	    	res.status(200).send("Ride finished.").end();
	    } else {
	    	res.status(409).send("Ride must have started to be finished.")
	    }
    }
  }
});

/**
 * Change ride status to "returned" - owner confirmed bike was returned
 * @name PUT/api/rides/returned
 * @param {string} bike_id - bike id
 * @return {string} - confirmation
 * @throws {401} - if user is not logged in or user isn't bike owner
 * @throws {404} - if ride is not found
 * @throws {409} - if bike wasn't returned yet
 */
router.put('/returned/:id', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to use a ride.',
    }).end();
  } else {
  	rideData = await Rides.getRideForID(req.params.id);
    ride = rideData[0];
    if (ride === undefined) {
    	res.status(404).send("Could not find a ride with id: " + req.params.id).end();
    } else {
      bike = await Bikes.findOne(ride.bikeid);
      if (bike.owner !== req.session.username) {
        res.status(401).send("Cannot confirm bike return for a bike you don't own.").end();
      } else {
        if (ride.status === "finished") {
          Rides.advanceRideStatus(req.params.id);
          res.status(200).send("Bike returned.").end();
        } else {
          res.status(409).send("Rider must have returned the bike to confirm.")
        }
      }
    }
  }
});

/**
 * Change ride status to "reviewed" - user reviewed the bike
 * @name PUT/api/rides/reviewed/:id
 * @param {string} bike_id - bike id
 * @return {string} - confirmation
 * @throws {401} - if user is not logged in or user isn't rider
 * @throws {404} - if ride is not found
 * @throws {409} - if bike ride wasn't finished yet
 */
router.put('/reviewed/:id', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: 'Please log in to use a ride.',
    }).end();
  } else {
  	rideData = await Rides.getRideForID(req.params.id);
    ride = rideData[0];
    if (ride === undefined) {
    	res.status(404).send("Could not find a ride with id: " + req.params.id).end();
    } else if (ride.user !== req.session.username) {
    	res.status(401).send("Cannot review another user's ride.").end();
    } else {
    	if (ride.status === "returned") {
	    	Rides.advanceRideStatus(req.params.id);
	    	res.status(200).send("Ride reviewed.").end();
	    } else {
	    	res.status(409).send("Ride must have finished to be reviewed.")
	    }
    }
  }
});

module.exports = router;
