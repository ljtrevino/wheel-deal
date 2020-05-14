const database = require('../database');

/** 
 * username VARCHAR(30) PRIMARY KEY,
 * password VARCHAR(30), 
 * name VARCHAR(50),
 * phone CHAR(10)
 */

/**
 * @class Users
 * Stores all Users.
 * Note that all methods are static.
 * Wherever you import this class, you will be accessing the same data.
 */
class Users {
  /**
   * Make a new User
   * @prop {string} username - user's username
   * @prop {string} password - user's password
   * @prop {string} name - user's full name
   * @prop {string} phone - user's phone number
   */
  static async create(username, password, name, phone) {
    try {
      const numbers = phone.replace(/-/g, '');
      const sql = `INSERT INTO Users (username, password, name, phone, balance) 
                    VALUES ('${username}', '${password}', '${name}', '${numbers}', 100);`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * True if username already taken
   * @param {string} username 
   * @returns {bool}
   */
  static async isUsernameTaken(username) {
    return await this.getByUsername(username) !== undefined;
  }
  
  /**
   * True if phone number already used
   * @param {string} phone 
   */
  static async isPhoneRegistered(phone) {
    return await this.getByPhoneNumber(phone) !== undefined;
  }

  /**
   * True if phone number is made up only of digits
   * @param {string} phone 
   */
  static async isPhoneValid(phone) {
    const numbers = phone.replace(/-/g, "");
    if (numbers.length < 10) return false;
    const n = Number(numbers);
    return (isNaN(n)) ? false : true;
  }

  /**
   * Return a user identified by their username
   * @param {string} username
   * @return {User | undefined}
   */
  static async getByUsername(username) {
    try {
      const sql = `SELECT * FROM Users WHERE username='${username}';`;
      const response = await database.query(sql);
      return response[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Return a user identified by their full name
   * @param {string} name
   * @return {User | undefined}
   */
  static async getByName(name) {
    try {
      const sql = `SELECT * FROM Users WHERE name='${name}';`;
      const response = await database.query(sql);
      return response[0];
    } catch (error) {
      throw error;
    }  
  }

 /**
   * Return a user identified by their phone number
   * @param {string} phone
   * @return {User | undefined}
   */
  static async getByPhoneNumber(phone) {
    const numbers = phone.replace(/-/g, '');
    try {
      const sql = `SELECT * FROM Users WHERE phone='${numbers}';`;
      const response = await database.query(sql);
      return response[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Return if the username and password matches
   * @param {string} username 
   * @param {string} password 
   * @returns {boolean} true if the username and password matches, otherwise false
   */
  static async isSuccessfulLogin(username, password) {
    try {
      const sql = `SELECT * FROM Users WHERE username='${username}' AND password='${password}';`;
      const response = await database.query(sql);
      return response[0] != undefined;
    } catch (error) {
      throw error;
    }  
  }

  /**
   * Update a User's password
   * @param {string} password - new password
   * @param {int} username - username to be updated
   * @return {User} - updated user
   */
  static async changePassword(password, username) {
    try {
      const sql = `UPDATE Users SET password='${password}' WHERE username='${username}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a User's balance
   * @param {string} username - username to be updated
   */
  static async getBalance(username) {
    try {
      const sql = `SELECT balance FROM Users WHERE username='${username}';`;
      const response = await database.query(sql);
      return response[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change a User's balance by amount
   * @param {string} username - username to be updated
   * @param {int} amount - balance += amount
   */
  static async updateBalance(username, amount) {
    try {
      const bal = this.getBalance(username);
      const sql = `UPDATE Users SET balance='${bal + amount}' WHERE username='${username}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Transfer amount from "from" to "to" user
   * @param {string} to user to get the money
   * @param {string} from user to take money from
   * @param {int} amount credits to transfer
   */
  static async transferBalance(to, from, amount) {
    try {
      const toBalance = await this.getBalance(to);
      const fromBalance = await this.getBalance(from);

      const newToBalance = toBalance['balance'] + amount;
      const newFromFalance = fromBalance['balance'] - amount;

      const sqlTo = `UPDATE Users SET balance='${newToBalance}' WHERE username='${to}';`;
      const sqlFrom = `UPDATE Users SET balance='${newFromFalance}' WHERE username='${from}';`;

      const responseTo = await database.query(sqlTo);
      const responseFrom = await database.query(sqlFrom);
      return [responseTo, responseFrom];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Users;
