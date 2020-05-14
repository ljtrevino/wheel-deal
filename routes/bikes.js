const express = require('express');

const Bikes = require('../models/Bikes');

const router = express.Router();

/**
 * List all bikes.
 * @name GET/api/bikes
 * @return {Bike[]} - list of bikes
 */
router.get('/', async (req, res) => {
  res.status(200).json(await Bikes.findAllAvailable()).end();
});

/**
 * List all bikes within a 0.2 degree radius of specified coordinates.
 * @name GET/api/bikes/location/?lat=:lat&lon=:longitude
 * :lat is the latitudinal coordinate
 * :longitude is the longitudinal coordinate
 * @return {Bike[]} - list of bikes
 * @throws {400} - if lat,lon is not specified
 * @throws {403} - if lat,lon is not valid
 */
router.get('/location/', async (req, res) => {
  if (req.query.lat.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify latitude coordinate.`,
    }).end();
  } else if (req.query.lon.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify longitude coordinate.`,
    }).end();
  } else if (isNaN(req.query.lat)
    || Number(req.query.lat) < -90
    || Number(req.query.lat) > 90) {
    res.status(403).json({
      error: `Latitude coordinate is invalid. Coordinate must be a number between -90.0 and 90.0 degrees.`,
    }).end();
  } else if (isNaN(req.query.lon)
    || Number(req.query.lon) < -180
    || Number(req.query.lon) > 180) {
    res.status(403).json({
      error: `Longitude coordinate is invalid. Coordinate must be a number between -180.0 and 180.0 degrees.`,
    }).end();
  } else {
    const bikes = await Bikes.findInProximity(req.query.lat, req.query.lon);
    res.status(200).json(bikes).end();
  }
});

/**
 * Get a bike's list of unavailable dates
 * @name GET/api/bikes/bike/:id/unavailability
 * :id is the id of the bike
 * @return {string[]} - the list of dates in format "month_day"
 * @throws {400} - if id not specified
 * @throws {404} - if bike does not exist
 */
router.get('/bike/:id/unavailability', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      error: `Please provide the ID of the bike.`,
    }).end();
  } else if (!Bikes.findOne(req.params.id)) {
    res.status(404).json({
      error: `Bike ${req.params.id} does not exist.`,
    }).end();
  } else {
    var dates = await Bikes.getUnavailableDates(req.params.id);
    res.status(200).json(dates).end();
  }
});

/**
 * See if a bike is available at all
 * @name GET/api/bikes/bike/:id/available
 * :id is the id of the bike
 * @return {bool} - true if there is availability, false otherwise
 * @throws {400} - if id not specified
 * @throws {404} - if bike does not exist
 */
router.get('/bike/:id/available', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      error: `Please provide the ID of the bike.`,
    }).end();
  } else if (!Bikes.findOne(req.params.id)) {
    res.status(404).json({
      error: `Bike ${req.params.id} does not exist.`,
    }).end();
  } else {
    var result = await Bikes.isAvailableAtAll(req.params.id);
    res.status(200).json(result).end();
  }
});

/**
 * Add availability to a bike
 * @name PUT/api/bikes/bike/:id/available
 * :id is the id of the bike
 * @return {bool} - true if there is availability, false otherwise
 * @throws {400} - if id, start, or end time not specified
 * @throws {403} - f start/end time invalid
 * @throws {404} - if bike does not exist
 */
router.put('/bike/:id/available', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      error: `Please provide the ID of the bike.`,
    }).end();
  } else if (!Bikes.findOne(req.params.id)) {
    res.status(404).json({
      error: `Bike ${req.params.id} does not exist.`,
    }).end();
  } else if (req.body.start.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify start time.`,
    }).end();
  } else if (req.body.end.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify end time.`,
    }).end();
  } else if (!Bikes.isValidTime(req.body.start)) {
    res.status(403).json({
      error: `Start time is invalid.`,
    }).end();
  } else if (!Bikes.isValidTime(req.body.end)) {
    res.status(403).json({
      error: `End time is invalid.`,
    }).end();
  } else {
    var result = await Bikes.addAvailability(req.params.id, req.body.start, req.body.end);
    res.status(200).json(result).end();
  }
});

/**
 * List all bikes available during specified window of time.
 * @name PUT/api/bikes/availability/?start=:start&end=:end
 * :start is the start of the window of time in which user would like to rent
 * :end is the end of the window of time in which user would like to rent
 * @return {Bike[]} - list of bikes
 * @throws {400} - if start,end is not specified
 * @throws {403} - if start,end is not valid
 */
router.put('/availability/', async (req, res) => {
  if (req.body.start.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify start time.`,
    }).end();
  } else if (req.body.end.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify end time.`,
    }).end();
  } else if (!Bikes.isValidTime(req.body.start)) {
    res.status(403).json({
      error: `Start time is invalid.`,
    }).end();
  } else if (!Bikes.isValidTime(req.body.end)) {
    res.status(403).json({
      error: `End time is invalid.`,
    }).end();
  } else {
    const ids = await Bikes.findAvailable(req.body.start, req.body.end);
    const bikes = await Bikes.findMany(ids);
    res.status(200).json(bikes).end();
  }
});

/**
 * List all bikes within a 0.2 degree radius of specified coordinates,
 * and available during specified window of time.
 * @name GET/api/bikes/search/?lat=:lat&lon=:lon&start=:start&end=:end
 * :lat is the latitudinal coordinate
 * :lon is the longitudinal coordinate
 * :start is the start of the window of time in which user would like to rent
 * :end is the end of the window of time in which user would like to rent
 * @return {Bike[]} - list of bikes
 * @throws {400} - if lat,lon,start,end is not specified
 * @throws {403} - if lat,lon,start,end is not valid
 */
router.get('/search/', async (req, res) => {
  if (req.query.lat.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify latitude coordinate.`,
    }).end();
  } else if (req.query.lon.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify longitude coordinate.`,
    }).end();
  } else if (req.query.start.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify start time.`,
    }).end();
  } else if (req.query.end.trim() === 'Infinity') {
    res.status(400).json({
      error: `Please specify end time.`,
    }).end();
  } else if (isNaN(req.query.lat)
    || Number(req.query.lat) < -90
    || Number(req.query.lat) > 90) {
    res.status(403).json({
      error: `Latitude coordinate is invalid. Coordinate must be a number between -90.0 and 90.0 degrees.`,
    }).end();
  } else if (isNaN(req.query.lon)
    || Number(req.query.lon) < -180
    || Number(req.query.lon) > 180) {
    res.status(403).json({
      error: `Longitude coordinate is invalid. Coordinate must be a number between -180.0 and 180.0 degrees.`,
    }).end();
  } else if (!Bikes.isValidTime(req.query.start)) {
    res.status(403).json({
      error: `Start time is invalid.`,
    }).end();
  } else if (!Bikes.isValidTime(req.query.end)) {
    res.status(403).json({
      error: `End time is invalid.`,
    }).end();
  } else {
    var bikes = await Bikes.findCloseAndAvailable(req.query.lat, req.query.lon, req.query.distance, req.query.start, req.query.end);
    res.status(200).json(bikes).end();
  }
});

/**
 * Get the damage fee for a stolen bike.
 * @name GET/api/bikes/bike/:id/damageFee
 * :id is the id of the bike
 * @return {int} - the damage fees for stolen bike
 * @throws {400} - if id not specified
 * @throws {404} - if bike does not exist
 */
router.get('/bike/:id/damageFee', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      error: `Please provide the ID of the bike.`,
    }).end();
  } else if (!Bikes.findOne(req.params.id)) {
    res.status(404).json({
      error: `Bike ${req.params.id} does not exist.`,
    }).end();
  } else {
    var dates = await Bikes.getDamageFee(req.params.id);
    res.status(200).json(dates).end();
  }
});

/**
 * Create a bike.
 * @name POST/api/bikes
 * @param {string} type - type of bike
 * @return {Bike} - the created bike
 * @throws {400} - if a price,latitude,longitude,startTime,endTime is not specified
 * @throws {401} - if user is not logged in
 */
router.post('/', (req, res) => {
  var price;
  price = (req.body.dailyPrice !== undefined) ? req.body.dailyPrice : undefined;
  price = (req.body.weeklyPrice !== undefined) ? req.body.weeklyPrice : undefined;
  price = (req.body.monthlyPrice !== undefined) ? req.body.monthlyPrice : undefined;

  if (!req.session.username) {
    res.status(401).json({
      error: `Please log in to make a bike.`,
    }).end();
  } else if (price === undefined
    || req.body.latitude === undefined
    || req.body.longitude === undefined
    || req.body.startTime === undefined
    || req.body.endTime === undefined) {
    res.status(400).json({
      error: `Please specify a price, location, and availability.`,
    }).end();
  } else if (req.body.damageFee === undefined) {
    res.status(400).json({
      error: `Please specify damage fees if bike becomes stolen.`,
    }).end();
  } else if (isNaN(price)
    || Number(price) <= 0) {
    res.status(403).json({
      error: `Price is invalid. Price must be a positive number.`,
    }).end();
  } else if (isNaN(req.body.latitude)
    || Number(req.body.latitude) < -90
    || Number(req.body.latitude) > 90) {
    res.status(403).json({
      error: `Latitude coordinate is invalid. Coordinate must be a number between -90.0 and 90.0 degrees.`,
    }).end();
  } else if (isNaN(req.body.longitude)
    || Number(req.body.longitude) < -180
    || Number(req.body.longitude) > 180) {
    res.status(403).json({
      error: `Longitude coordinate is invalid. Coordinate must be a number between -180.0 and 180.0 degrees.`,
    }).end();
  } else if (!Bikes.isValidTime(req.body.startTime)) {
    res.status(403).json({
      error: `Start time is invalid.`,
    }).end();
  } else if (!Bikes.isValidTime(req.body.endTime)) {
    res.status(403).json({
      error: `End time is invalid.`,
    }).end();
  } else {
    const bike = Bikes.addOne(
      req.session.username,
      req.body.type,
      req.body.dailyPrice,
      req.body.weeklyPrice,
      req.body.monthlyPrice,
      req.body.latitude,
      req.body.longitude,
      req.body.startTime,
      req.body.endTime,
      req.body.title,
      req.body.imageurl,
      req.body.damageFee
    );
    res.status(200).json(bike).end();
  }
});

/**
 * Update a bike.
 * @name PUT/api/bikes/bike/:id
 * @param {string} title - the new title of bike (optional)
 * @param {string} type - the new type of bike (optional)
 * @param {string} latitude - the new latitude of the Bike (optional)
 * @param {string} longitude - the new longitude of the Bike (optional)
 * @param {string} dailyPrice - the new daily price of the Bike (optional)
 * @param {string} weeklyPrice - the new weekly price of the Bike (optional)
 * @param {string} monthlyPrice - the new monthly price of the Bike (optional)
 * @param {string} startTime - the new start of the window of time in which the Bike can be rented (optional)
 * @param {string} endTime - the new end of the window of time in which the Bike can be rented (optional)
 * @param {string} imageurl - the new url pointing to an image of the bike (optional)
 * @return {Bike} - the created bike
 * @throws {400} - if bike id is not specified; if nothing has been provided to change
 * @throws {401} - if user is not logged in; if user is not creator of bike
 * @throws {403} - if field(s) to change is not valid
 * @throws {404} - if bike does not exist
 */
router.put('/bike/:id', async (req, res) => {
  var sessionName = req.session.username;
  var bikeId = req.params.id;
  var title = req.body.title;
  var type = req.body.type;
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  var dailyPrice = req.body.dailyPrice;
  var weeklyPrice = req.body.weeklyPrice;
  var monthlyPrice = req.body.monthlyPrice;
  var startTime = req.body.startTime;
  var endTime = req.body.endTime;
  var imageurl = req.body.imageurl;
  var damageFee = req.body.damageFee;

  var bike = await Bikes.findOne(bikeId);

  if (!sessionName) {
    res.status(401).json({
      error: `Please log in to update bike.`,
    }).end();
  } else if (bikeId === '-1') {
    res.status(400).json({
      error: `Please provide the ID of the bike to update.`,
    }).end();
  } else if (!bike) {
    res.status(404).json({
      error: `Bike ${bikeId} does not exist.`,
    }).end();
  } else if (bike.owner !== sessionName) {
    res.status(401).json({
      error: `User must be creator of bike ${bikeId} to modify bike.`,
    }).end();
  } else if ((dailyPrice !== undefined && (isNaN(dailyPrice) || Number(dailyPrice) <= 0))
    || (weeklyPrice !== undefined && (isNaN(weeklyPrice) || Number(weeklyPrice) <= 0))
    || (monthlyPrice !== undefined && (isNaN(monthlyPrice) || Number(monthlyPrice) <= 0))){
    res.status(403).json({
      error: `Price is invalid. Price must be a positive number.`,
    }).end();
  } else if (latitude !== undefined
    && (isNaN(latitude) || Number(latitude) < -90 || Number(latitude) > 90)) {
    res.status(403).json({
      error: `Latitude coordinate is invalid. Coordinate must be a number between -90.0 and 90.0 degrees.`,
    }).end();
  } else if (longitude !== undefined
    && (isNaN(longitude) || Number(longitude) < -180 || Number(longitude) > 180)) {
    res.status(403).json({
      error: `Longitude coordinate is invalid. Coordinate must be a number between -180.0 and 180.0 degrees.`,
    }).end();
  } else if (startTime !== undefined
    && !Bikes.isValidTime(startTime)) {
    res.status(403).json({
      error: `Start time is invalid.`,
    }).end();
  } else if (endTime !== undefined
    && !Bikes.isValidTime(endTime)) {
    res.status(403).json({
      error: `End time is invalid.`,
    }).end();
  } else if (damageFee <= 0) {
    res.status(403).json({
      error: `Damage fees must be a positive number.`,
    }).end();
  } else {
    var mBike = undefined;
    mBike = (title.trim() !== '') ? await Bikes.updateTitle(bikeId, title) : mBike;
    mBike = (type !== undefined) ? await Bikes.updateType(bikeId, type) : mBike;
    mBike = (latitude !== undefined && longitude !== undefined) ? await Bikes.updateLocation(bikeId, latitude, longitude) : mBike;
    mBike = (dailyPrice !== undefined) ? await Bikes.updatePrice(bikeId, dailyPrice, "daily") : mBike;
    mBike = (weeklyPrice !== undefined) ? await Bikes.updatePrice(bikeId, weeklyPrice, "weekly") : mBike;
    mBike = (monthlyPrice !== undefined) ? await Bikes.updatePrice(bikeId, monthlyPrice, "monthly") : mBike;
    mBike = (startTime !== undefined) ? await Bikes.updateAvailability(bikeId, startTime, endTime) : mBike;
    mBike = (imageurl.trim() !== '') ? await Bikes.updateImageurl(bikeId, imageurl) : mBike;
    mBike = (damageFee !== undefined) ? await Bikes.updateDamageFee(bikeId, damageFee) : mBike;

    if (mBike === undefined) {
      res.status(400).json({
        error: `Nothing has been provided to change.`,
      }).end();
    } else {
      res.status(200).json(mBike).end();
    }
  }
});

/**
 * Update a bike's price.
 * @name PUT/api/bikes/bike/:id/price
 * :id is the id of the bike
 * @param {string} price - the new price of the Bike
 * @param {string} timeframe - the timeframe to which the price applies
 * @return {Bike} - the updated bike
 * @throws {400} - if id,price is not specified
 * @throws {401} - if user is not creator of bike
 * @throws {404} - if bike does not exist
 */
router.put('/bike/:id/price', (req, res) => {
  if (req.params.id === '-1') {
    res.status(400).json({
      error: `Please provide the ID of the bike to update.`,
    }).end();
  } else if (!Bikes.findOne(req.params.id)) {
    res.status(404).json({
      error: `Bike ${req.params.id} does not exist.`,
    }).end();
  } else if (Bikes.findOne(req.params.id).owner !== req.session.username) {
    res.status(401).json({
      error: `User must be creator of bike ${req.params.id} to modify bike.`,
    }).end();
  } else if (req.body.price.trim() === '') {
    res.status(400).json({
      error: `Please specify new price.`,
    }).end();
  } else {
    const bike = Bikes.updatePrice(req.params.id, req.body.price, req.body.timeframe);
    res.status(200).json(bike).end();
  }
});

/**
 * Update a bike's location.
 * @name PUT/api/bikes/bike/:id/location
 * :id is the id of the bike
 * @param {string} latitude - the new latitude of the Bike
 * @param {string} longitude - the new longitude of the Bike
 * @return {Bike} - the updated bike
 * @throws {400} - if id,latitude,longitude is not specified
 * @throws {401} - if user is not creator of bike
 * @throws {403} - if id,latitude,longitude is not valid
 * @throws {404} - if bike does not exist
 */
router.put('/bike/:id/location', (req, res) => {
  if (req.params.id === '-1') {
    res.status(400).json({
      error: `Please provide the ID of the bike to update.`,
    }).end();
  } else if (!Bikes.findOne(req.params.id)) {
    res.status(404).json({
      error: `Bike ${req.params.id} does not exist.`,
    }).end();
  } else if (Bikes.findOne(req.params.id).owner !== req.session.username) {
    res.status(401).json({
      error: `User must be creator of bike ${req.params.id} to modify bike.`,
    }).end();
  } else if (req.body.latitude.trim() === '') {
    res.status(400).json({
      error: `Please specify latitude.`,
    }).end();
  } else if (req.body.longitude.trim() === '') {
    res.status(400).json({
      error: `Please specify longitude.`,
    }).end();
  } else if (isNaN(req.body.latitude)
    || Number(req.body.latitude) < -90
    || Number(req.body.latitude) > 90) {
    res.status(403).json({
      error: `Latitude coordinate is invalid. Coordinate must be a number between -90 and 90 degrees.`,
    }).end();
  } else if (isNaN(req.body.longitude)
    || Number(req.body.longitude) < -180
    || Number(req.body.longitude) > 180) {
    res.status(403).json({
      error: `Longitude coordinate is invalid. Coordinate must be a number between -90 and 90 degrees.`,
    }).end();
  } else {
    const bike = Bikes.updateLocation(req.params.id, req.body.latitude, req.body.longitude);
    res.status(200).json(bike).end();
  }
});

/**
 * Update a bike's availability.
 * @name PUT/api/bikes/bike/:id/availability
 * :id is the id of the bike
 * @param {string} startTime - the start of the window of time in which the Bike can be rented
 * @param {string} endTime - the end of the window of time in which the Bike can be rented
 * @return {Bike} - the updated bike
 * @throws {400} - if id,startTime, endTime is not specified
 * @throws {401} - if user is not creator of bike
 * @throws {404} - if bike does not exist
 */
router.put('/bike/:id/availability', (req, res) => {
  if (req.params.id === '-1') {
    res.status(400).json({
      error: `Please provide the ID of the bike to update.`,
    }).end();
  } else if (!Bikes.findOne(req.params.id)) {
    res.status(404).json({
      error: `Bike ${req.params.id} does not exist.`,
    }).end();
  } else if (Bikes.findOne(req.params.id).owner !== req.session.username) {
    res.status(401).json({
      error: `User must be creator of bike ${req.params.id} to modify bike.`,
    }).end();
  } else if (req.body.startTime.trim() === '') {
    res.status(400).json({
      error: `Please specify start time.`,
    }).end();
  } else if (req.body.endTime.trim() === '') {
    res.status(400).json({
      error: `Please specify end time.`,
    }).end();
  } else {
    const bike = Bikes.updateAvailability(req.params.id, req.body.startTime, req.body.endTime);
    res.status(200).json(bike).end();
  }
});

/**
 * Delete a bike.
 * @name DELETE/api/bikes/:id
 * :id is the id of the bike
 * @return {Bike} - the deleted bike
 * @throws {400} - if id is not specified
 * @throws {401} - if user is not creator of bike
 * @throws {404} - if bike does not exist
 */
router.delete('/:id', async (req, res) => {
  const foundBike = await Bikes.findOne(req.params.id);
  if (req.params.id === '-1') {
    res.status(400).json({
      error: `Please provide the ID of the bike to delete.`,
    }).end();
  } else if (!Bikes.findOne(req.params.id)) {
    res.status(404).json({
      error: `Bike ${req.params.id} does not exist.`,
    }).end();
  } else if (foundBike.owner !== req.session.username) {
    res.status(401).json({
      error: `User must be creator of bike ${req.params.id} to delete bike.`,
    }).end();
  } else {
    const bike = Bikes.deleteOne(req.params.id);
    res.status(200).json(bike).end();
  }
});

module.exports = router;
