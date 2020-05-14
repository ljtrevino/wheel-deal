const express = require('express');

const Bikes = require('../models/Bikes');
const Reviews = require('../models/Reviews');
const Users = require('../models/Users');

const router = express.Router();

/**
 * List all reviews.
 * @name GET/api/reviews
 * @return {Review[]} - list of reviews
 */
router.get('/', async (req, res) => {
  res.status(200).json(await Reviews.findAll()).end();
});

/**
 * List all reviews made by reviewer.
 * @name GET/api/reviews/by/:reviewer
 * :reviewer is the username of the reviewer whose reviews we're getting
 * @return {Review[]} - list of reviews
 * @throws {400} - if reviewer is not specified
 * @throws {404} - if reviewer does not exist
 */
router.get('/by/:reviewer', async (req, res) => {
  if (req.params.reviewer.trim() === '-1') {
    res.status(400).json({
      error: `Please specify reviewer.`,
    }).end();
  } else if (!Users.getByUsername(req.params.reviewer)) {
    res.status(404).json({
      error: `User ${req.params.reviewer} does not exist.`,
    }).end();
  } else { 
    const reviews = await Reviews.findByReviewer(req.params.reviewer);
    res.status(200).json(reviews).end();
  }
});

/**
 * List all reviews made for entity.
 * @name GET/api/reviews/for/:entity
 * :entity is the entity for whom we're getting reviews
 * @return {Review[]} - list of reviews
 * @throws {400} - if entity is not specified
 * @throws {404} - if entity does not exist
 */
router.get('/for/:entity', async (req, res) => {
  if (req.params.entity.trim() === '-1') {
    res.status(400).json({
      error: `Please specify entity.`,
    }).end();
  } else if (!Users.getByUsername(req.params.entity) 
          && !Bikes.findOne(req.params.entity)) {
    res.status(404).json({
      error: `Entity ${req.params.entity} does not exist.`,
    }).end();
  } else { 
    const reviews = await Reviews.findForEntity(req.params.entity);
    res.status(200).json(reviews).end();
  }
});

/**
 * Compute overall rating for entity.
 * @name GET/api/reviews/:entity/rating
 * :entity is the entity for whom we're getting reviews
 * @return {Review[]} - list of reviews
 * @throws {400} - if entity is not specified
 * @throws {404} - if entity does not exist
 */
router.get('/:entity/rating', async (req, res) => {
  if (req.params.entity.trim() === '-1') {
    res.status(400).json({
      error: `Please specify entity.`,
    }).end();
  } else if (!Users.getByUsername(req.params.entity) 
          && !Bikes.findOne(req.params.entity)) {
    res.status(404).json({
      error: `Entity ${req.params.entity} does not exist.`,
    }).end();
  } else { 
    const rating = await Reviews.computeOverallRating(req.params.entity);
    res.status(200).json(rating).end();
  }
});

/**
 * Create a review.
 * @name POST/api/reviews
 * @param {string} rideid - id of ride on basis of which we're rating the entity
 * @param {string} recipient - id of recipient entity (username or bike id)
 * @param {string} rating - number on a 5.0 scale
 * @param {string} comment - string description (optional)
 * @return {Review} - the created review
 * @throws {400} - if recip_id,rating,comment is not specified
 * @throws {401} - if user is not logged in
 * @throws {403} - if user is writing review for self
 * @throws {404} - if entity with id recip_id does not exist
 */
router.post('/', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: `Please log in to write a review.`,
    }).end();
  } else if (req.body.recipient === undefined
    || req.body.rating === undefined) {
    res.status(400).json({
      error: `Please specify recipient and rating.`,
    }).end();
  } else if (isNaN(req.body.rating)
    || Number(req.body.rating) < 0
    || Number(req.body.rating) > 5) {
    res.status(403).json({
      error: `Rating is invalid. Must be a number between 0 and 5.`,
    }).end();
  } else if (!Users.getByUsername(req.body.recipient) 
    && !Bikes.findOne(req.body.recipient)) {
    res.status(404).json({
      error: `Entity ${req.body.recipient} does not exist.`,
    }).end();
  } else if (req.session.username === req.body.recipient) {
    res.status(403).json({
      error: `User cannot write review for self.`,
    }).end();
  } else {
    const review = await Reviews.addOne(
      req.body.rideid,
      req.session.username,
      req.body.recipient,
      req.body.rating,
      req.body.text
    );
    res.status(200).json(review).end();
  }
});

/**
 * Update a review.
 * @name PUT/api/reviews/review/:id
 * :id is the id of the review
 * @param {string} rating - the new rating for the Review
 * @param {string} comment - the new comment for the Review (optional)
 * @return {Review} - the updated review
 * @throws {400} - if id,rating,comment is not specified
 * @throws {401} - if user is not the creator of the review
 * @throws {403} - if id,rating is not valid
 * @throws {404} - if review does not exist
 */
router.put('/review/:id', async (req, res) => {
  if (req.params.id === '-1') {
    res.status(400).json({
      error: `Please provide the ID of the review to update.`,
    }).end();
  } else if (await !Reviews.findOne(req.params.id)) {
    res.status(404).json({
      error: `Review ${req.params.id} does not exist.`,
    }).end();
  } else if (await Reviews.findOne(req.params.id).reviewer !== req.session.username) {
    res.status(401).json({
      error: `User must be creator of review ${req.params.id} to modify review.`,
    }).end();
  } else if (req.body.rating.trim() === '') {
    res.status(400).json({
      error: `Please specify rating.`,
    }).end();
  } else if (isNaN(req.body.rating)
    || Number(req.body.rating) < 0.0
    || Number(req.body.rating) > 5.0) {
    res.status(403).json({
      error: `Rating is invalid. Must be a number between 0.0 and 5.0.`,
    }).end();
  } else {
    const review = await Reviews.updateOne(req.params.id, req.body.rating, req.body.text);
    res.status(200).json(review).end();
  }
});

/**
 * Delete a review.
 * @name DELETE/api/reviews/:id
 * :id is the id of the review
 * @return {Review} - the deleted review
 * @throws {400} - if id is not specified
 * @throws {401} - if user is not creator of review
 * @throws {404} - if review does not exist
 */
router.delete('/:id', async (req, res) => {
  if (req.params.id === '-1') {
    res.status(400).json({
      error: `Please provide the ID of the review to delete.`,
    }).end();
  } else if (await !Reviews.findOne(req.params.id)) {
    res.status(404).json({
      error: `Review ${req.params.id} does not exist.`,
    }).end();
  } else if (await Reviews.findOne(req.params.id).creator !== req.session.username) {
    res.status(401).json({
      error: `User must be creator of review ${req.params.id} to delete review.`,
    }).end();
  } else {
    const review = await Reviews.deleteOne(req.params.id);
    res.status(200).json(review).end();
  }
});

module.exports = router;