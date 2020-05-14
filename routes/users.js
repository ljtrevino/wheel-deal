const express = require('express');
const Users = require('../models/Users');

const router = express.Router();

/**
 * Set active user.
 * @name POST/api/users/signin
 * @throws {400} - if username/password is not provided
 * @throws {401} - if username and password don't match
 * @throws {403} - if already logged in
 * @throws {404} - if user does not exist
 */
router.post('/signin', async (req, res) => {
  const user = await Users.getByUsername(req.body.username);
  const match = await Users.isSuccessfulLogin(req.body.username, req.body.password);
  if (!req.body.username | !req.body.password) {
    res.status(400).json({
      error: `Please provide a username and password.`,
    }).end();
  } else if (req.session.username) {
    res.status(403).json({
      error: `You are already logged in. Log out before logging in again.\n`,
    }).end();
  } else if (user === undefined) {
    res.status(404).json({
      error: `User ${req.body.username} doesn't exist.`,
    }).end();
  } else if (!match) {
    res.status(401).json({
      error: `Username and password don't match.`,
    }).end();
  } else {
    req.session.username = req.body.username;
    console.log("signed in");
    console.log("session username");
    console.log(req.session.username);
    res.status(200).json(req.body).end();
  }
});

/**
 * Closes user session.
 * @name POST/api/users/signout
 * @throws {401} - if not logged in
 */
router.post('/signout', (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: `You are not logged in.`,
    }).end();
  } else {
    req.session.destroy();
    res.status(200).end();
  }
});

/**
 * Create a new user.
 * @name POST/api/users/
 * @param {string} username - new username
 * @param {string} password - new password
 * @param {string} name - full name
 * @param {string} phone - phone number
 * @return {user} - the user
 * @throws {400} - if username, password, full name, or phone number is not provided
 * @throws {403} - if not logged out, or if username/phone number already in use
 */
router.post('/', async (req, res) => {
  const usernameTaken = await Users.isUsernameTaken(req.body.username);
  const phoneRegistered = await Users.isPhoneRegistered(req.body.phone);
  const phoneIsValid = await Users.isPhoneValid(req.body.phone);
  if (!req.body.username
        | !req.body.password
        | !req.body.name
        | !req.body.phone) {
    res.status(400).json({
      error: `Please provide a username, password, name, and phone number.`,
    }).end();
  } else if (req.session.username) {
    res.status(403).json({
      error: `Please log out to create a new user.`,
    }).end();
  } else if (usernameTaken) {
    res.status(403).json({
      error: `Username already taken. Please pick a different one.`,
    }).end();
  } else if (phoneRegistered) {
    res.status(403).json({
      error: `Phone number already in use. Please pick a different one.`,
    }).end();
  } else if (!phoneIsValid) {
    res.status(403).json({
      error: `Phone number is invalid. Please ensure phone number is made up of digits.`,
    }).end();
  } else {
    const user = await Users.create(
        req.body.username,
        req.body.password,
        req.body.name,
        req.body.phone);
    req.session.username = await req.body.username;
    res.status(200).json(user).end();
  }
});

/**
 * Get logged in user.
 * @name GET/api/users/
 * @return {user} - the user
 */
router.get('/', async (req, res) => {
  username = req.session.username;
  const user = await Users.getByUsername(username);
  res.status(200).json(user).end();
});

/**
 * Change active user's password
 * @name PUT/api/users/account/password
 * @param {string} password - new password
 * @return {string} - the new password
 * @throws {400} - if password is not provided
 * @throws {401} - if not logged in
 */
router.put('/account/password', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: `Please log in to change your password.`,
    }).end();
  } else if (!req.body.password) {
    res.status(400).json({
      error: `Please provide a new password.`,
    }).end();
  } else {
    const password = await Users.changePassword(req.body.password, req.session.username);
    res.status(200).json(password).end();
  }
});

/**
 * Get current logged in user
 * @name GET/api/users/current
 * @return {String} - username
 */
 router.get('/current', (req, res) => {
   if (req.session.username === undefined){
     res.status(401).json({
       error: `User not logged in`,
     }).end();
   } else {
     res.status(200).json({username: req.session.username}).end();
   }
 });

 ////////////////////////////////////////////////////////////////////////////////////////////////
 // Balance Operations

/**
 * Get active user's balance
 * @name GET/api/users/account/balance
 * @param {int} amount - amount
 * @return {string} - the new balance
 * @throws {400} - if balance is not provided
 * @throws {401} - if not logged in
 */
router.get('/account/balance', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: `Please log in to see your balance.`,
    }).end();
  } else {
    var result = await Users.getBalance(req.session.username);
    res.status(200).json(result).end();
  }
});

/**
 * Change active user's balance
 * @name PUT/api/users/account/balance
 * @param {int} amount - amount
 * @return {string} - the new balance
 * @throws {400} - if amount is not provided
 * @throws {401} - if not logged in
 */
router.put('/account/balance', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: `Please log in to change your balance.`,
    }).end();
  } else if (!req.body.amount) {
    res.status(400).json({
      error: `Please provide the amount to add.`,
    }).end();
  } else {
    var result = await Users.updateBalance(req.session.username, req.body.amount);
    res.status(200).json(result).end();
  }
});

/**
 * Transfer active user's balance to another user
 * @name POST/api/users/account/balance/transfer
 * @param {int} amount - amount
 * @param {string} user - user to transfer money to
 * @return {string} - the new balance
 * @throws {400} - if amount is not provided
 * @throws {401} - if not logged in
 */
router.post('/account/balance/transfer', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      error: `Please log in to transfer your balance.`,
    }).end();
  } else if (!req.body.amount) {
    res.status(400).json({
      error: `Please provide the amount to transfer.`,
    }).end();
  } else {
    // function params: TO, FROM, AMOUNT
    var result = await Users.transferBalance(req.body.user, req.session.username, req.body.amount);
    res.status(200).json(result).end();
  }
});

module.exports = router;
