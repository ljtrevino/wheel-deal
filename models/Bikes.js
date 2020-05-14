const database = require('../database');

const AVAIL_START = new Date(2019, 11, 1);
const AVAIL_END = new Date(2020, 1, 29);
const MS_IN_DAY = 86400000;

// id INT PRIMARY KEY auto_increment,
// title VARCHAR(50),
// owner VARCHAR(30) REFERENCES users(username),
// type VARCHAR(8),
// latitude DECIMAL(8,6),
// longitude DECIMAL(9,6),
// hourly DECIMAL(6,2),
// daily DECIMAL(6,2),
// weekly DECIMAL(6,2),
// monthly DECIMAL(6,2)

/**
 * @class Bikes
 * Stores all Bikes.
 * Note that all methods are static async.
 * Wherever you import this class, you will be accessing the same data.
 */
class Bikes {
  /**
   * Make a new Bike
   * @param {string} username - bike owner's username
   * @param {object} type - bike's type
   * @return {Bike} - created bike
   */
  static async addOne(username, type, dailyPrice, weeklyPrice, monthlyPrice, latitude, longitude, start, end, title, url, damageFee) {
    var daysInWeek = 7.0;
    var daysInMonth = 30.0;
    var weeksInMonth = 4.0;

    var price;
    if (dailyPrice) {
      price = {
        daily: dailyPrice,
        weekly: (weeklyPrice === undefined) ? daysInWeek*dailyPrice : weeklyPrice,
        monthly: (monthlyPrice === undefined) ? daysInMonth*dailyPrice : monthlyPrice
      };
    } else if (weeklyPrice) {
      price = {
        daily: (dailyPrice === undefined) ? weeklyPrice/daysInWeek : dailyPrice,
        weekly: weeklyPrice,
        monthly: (monthlyPrice === undefined) ? weeksInMonth*weeklyPrice : monthlyPrice
      };
    } else {
      price = {
        daily: (dailyPrice === undefined) ? monthlyPrice/daysInMonth : dailyPrice,
        weekly: (weeklyPrice === undefined) ? monthlyPrice/weeksInMonth : weeklyPrice,
        monthly: monthlyPrice
      };
    }

    try {
      // insert into Bikes DB
      const sql = `INSERT INTO Bikes (title, owner, type, latitude, longitude,
                                       hourly, daily, weekly, monthly, url, damagefee)
                    VALUES ('${title}', '${username}', '${type}', '${latitude}', '${longitude}',
                              '${price.hourly}', '${price.daily}', '${price.weekly}', '${price.monthly}', '${url}', '${damageFee}');`;
      const response = await database.query(sql);

      // find the id
      const findId = `SELECT id FROM Bikes ORDER BY ID DESC LIMIT 1`;
      const response2 = await database.query(findId);
      const id = response2[0].id;
      // create availability for bike id
      await this.createAvailability(id, start, end);

      return response;
    } catch (error) {
      throw error;
    }
  }

  static async isValidBikeId(id) {
    return this.findOne(id) !== undefined;
  }

    /**
   * Find a Bike by Id.
   * @param {string} id - id of Bike to find
   * @return {Bike | undefined} - found Bike
   */
  static async findOne(id) {
    try {
      const sql = `SELECT * FROM Bikes WHERE id='${id}';`;
      const response = await database.query(sql);
      return response[0];
    } catch (error) {
      throw error;
    }
  }

  static async findMany(ids) {
    if (!ids.length) {
      return; // no ids
    }

    try {
      var sql = `SELECT * FROM Bikes WHERE id IN (`;
      ids.forEach(id => { sql += `'${id}', ` });
      sql = sql.slice(0, -2) + ");";
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Return an array of all of the Bikes.
   * @return {Bike[]}
   */
  static async findAll() {
    try {
      const sql = `SELECT * FROM Bikes;`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

    /**
   * Return an array of all of the availble Bikes.
   * @return {Bike[]}
   */
  static async findAllAvailable() {
    try {
      const sql = `SELECT * FROM Bikes;`;
      const response = await database.query(sql);
      let output = [];
      // response = response.filter(async row => {
      //   let val = await this.isAvailableAtAll(row['id']);
      //   if (!val) { console.log(row['id']); }
      //   return val;
      // });   

      for (let i = 0; i < response.length; i++) {
        let row = response[i];
        let val = await this.isAvailableAtAll(row['id']);
        if (val) { 
          output.push(row);
        }
      }
      return output;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Return an array of all bikes that user owns
   * @param {string} username bike owner
   */
  static async findForOwner(username) {
    try {
      const sql = `SELECT * FROM Bikes WHERE owner='${username}'`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Return an array of all Bikes within a 0.2 degree radius of specified coordinates.
   * @return {Bike[]}
   */
  static async findInProximity(latitude, longitude, distance) {
    let tolerance = distance ? distance : 0.2;
    let q_lat = Number(latitude);
    let q_lon = Number(longitude);

    const latLow = q_lat - tolerance;
    const latHigh = q_lat + tolerance;
    const lonLow = q_lon - tolerance;
    const lonHigh = q_lon + tolerance;

    try {
      const sql = `SELECT * FROM Bikes WHERE
        latitude BETWEEN ${latLow} AND ${latHigh}
        AND longitude BETWEEN ${lonLow} AND ${lonHigh};`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Return an array of all Bikes available during specified window of time.
   * @todo update this
   * @return {Bike[]}
   */
  static async findAvailable(startTime, endTime) {
    const s_bits = startTime.split('-');
    const s_t = new Date(s_bits[0], s_bits[1] - 1, s_bits[2]);
    const e_bits = endTime.split('-');
    const e_t = new Date(e_bits[0], e_bits[1] - 1, e_bits[2]);

    try {
      var sql = `SELECT id FROM Availability WHERE(`;
      var loop = new Date(s_t);
      while(loop <= e_t){
        let month = loop.getMonth() + 1;
        let day = loop.getDate();
        sql += `${month}_${day} = 1`;

        var newDate = loop.setDate(loop.getDate() + 1);
        loop = new Date(newDate);

        if (loop <= e_t) {
          sql += ` AND `;
        }
      }
      sql += `);`;

      const idData = await database.query(sql);
      const ids = [];
      idData.forEach(data => { ids.push(data.id); });
      return ids;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Returns a list of bikes that are in proximity of lat, lon and are available between start and end
   * @param {string} latitude
   * @param {string} longitude
   * @param {string} distance - radius to search in, in the form of lat/lon range
   * @param {string} startTime
   * @param {string} endTime
   */
  static async findCloseAndAvailable(latitude, longitude, distance, startTime, endTime) {
    try {
      var availableIds = await this.findAvailable(startTime, endTime);
      var closeBikes = await this.findInProximity(latitude, longitude, distance);

      var bikes = closeBikes.filter(row => {
        return availableIds.includes(row.id);
      })
      
      return bikes;
    } catch (error) {
      throw error;
    }
  }

  static async createAvailability(id, startTime, endTime) {
    let date = AVAIL_START;

    const s_bits = startTime.split('-');
    const start = new Date(s_bits[0], s_bits[1] - 1, s_bits[2]);
    const e_bits = endTime.split('-');
    const end = new Date(e_bits[0], e_bits[1] - 1, e_bits[2]);

    let sql = `INSERT INTO Availability(id`;
    for (var day = 1; day <= 31; day++) { sql += `, 12_${day}`; } // December
    for (var day = 1; day <= 31; day++) { sql += `, 1_${day}`; } // Jan
    for (var day = 1; day <= 29; day++) { sql += `, 2_${day}`; } // Feb
    sql += `) VALUES (${id}`

    for (var day = 1; day <= (31 + 31 + 29); day++) {
      if (date >= start && date <= end) {
        sql += ",'1'";
      } else {
        sql += ",'0'";
      }

      // calculate the next day
      date = new Date(date.setTime( date.getTime() + MS_IN_DAY ));
    }
    sql += ");";

    try {
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update availability for a Bike.
   * @param {string} id - id of Bike to update
   * @param {string} startTime - the start of the window of time in which the Bike can be rented
   * @param {string} endTime - the end of the window of time in which the Bike can be rented
   * @return {Bike} - updated Bike
   */
  static async updateAvailability(id, startTime, endTime) {
    let date = AVAIL_START;

    const s_bits = startTime.split('-');
    const start = new Date(s_bits[0], s_bits[1] - 1, s_bits[2]);
    const e_bits = endTime.split('-');
    const end = new Date(e_bits[0], e_bits[1] - 1, e_bits[2]);

    let sql = `UPDATE Availability SET `;

    // December
    for (var day = 1; day <= 31; day++) {
      sql += `12_${day} = `;

      if (date >= start && date <= end) {
        sql += "'1', ";
      } else {
        sql += "'0', ";
      }

      // calculate the next day
      date = new Date(date.setTime( date.getTime() + MS_IN_DAY ));
    }

    // January
    for (var day = 1; day <= 31; day++) {
      sql += `1_${day} = `;

      if (date >= start && date <= end) {
        sql += "'1', ";
      } else {
        sql += "'0', ";
      }

      // calculate the next day
      date = new Date(date.setTime( date.getTime() + MS_IN_DAY ));
    }

    // February
    for (var day = 1; day <= 29; day++) {
      sql += `2_${day} = `;

      if (date >= start && date <= end) {
        sql += "'1', ";
      } else {
        sql += "'0', ";
      }

      // calculate the next day
      date = new Date(date.setTime( date.getTime() + MS_IN_DAY ));
    }

    sql = sql.slice(0, -2);
    sql += ` WHERE id=${id};`

    try {
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove availability for a Bike.
   * @param {string} id - id of Bike to update
   * @param {string} startTime - the start of the window of time in which the Bike can be rented
   * @param {string} endTime - the end of the window of time in which the Bike can be rented
   * @return {Bike} - updated Bike
   */
  static async removeAvailability(id, startTime, endTime) {
    const s_bits = startTime.substring(0, 10).split('-');
    const start = new Date(s_bits[0], s_bits[1] - 1, s_bits[2]);
    const e_bits = endTime.substring(0, 10).split('-');
    const end = new Date(e_bits[0], e_bits[1] - 1, e_bits[2]);

    let date = start;
    let sql = `UPDATE Availability SET `;

    while (date <= end) {
      sql += `${(date.getMonth() + 1) % 13}_${date.getDate()}='0',`;
      date = new Date(date.setTime( date.getTime() + MS_IN_DAY )); // get next day
    }

    sql = sql.slice(0, -1); // remove last comma
    sql += ` WHERE id='${id}';`

    try {
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add availability for a Bike.
   * @param {string} id - id of Bike to update
   * @param {string} startTime - the start of the window of time in which the Bike can be rented
   * @param {string} endTime - the end of the window of time in which the Bike can be rented
   * @return {Bike} - updated Bike
   */
  static async addAvailability(id, startTime, endTime) {
    const s_bits = startTime.substring(0, 10).split('-');
    const start = new Date(s_bits[0], s_bits[1] - 1, s_bits[2]);
    const e_bits = endTime.substring(0, 10).split('-');
    const end = new Date(e_bits[0], e_bits[1] - 1, e_bits[2]);

    let date = start;
    let sql = `UPDATE Availability SET `;

    while (date <= end) {
      sql += `${(date.getMonth() + 1) % 13}_${date.getDate()}='1',`;
      date = new Date(date.setTime( date.getTime() + MS_IN_DAY )); // get next day
    }

    sql = sql.slice(0, -1); // remove last comma
    sql += ` WHERE id='${id}';`

    try {
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Returns all dates and their availability statuses, where 1 = available and 0 = unavailable
   * @param {int} id bike id
   */
  static async getAvailability(id) {
    try {
      const sql = `SELECT * FROM Availability WHERE id=${id};`;
      const response = await database.query(sql);
      return response[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Returns a list of dates when the bike is not available
   * @param {int} id bike id
   */
  static async getUnavailableDates(id) {
    try {
      const availabilities = await this.getAvailability(id);
      if (!availabilities) {
        return availabilities;
      }
      // iterate through and check availabilities
      var unavailableDates = []
      Object.keys(availabilities).forEach((key,index) => {
        if (index == 0) {
          return; // first property is id
        }

        if (availabilities[key] == 0) {
          var date = key.startsWith("12") 
                      ? key + "_19"
                      : key + "_20";
          unavailableDates.push(date);
        }
      });

      return unavailableDates;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Returns true if available at all between 12/1 - 2/29, and false otherwise
   * @param {int} id bike id
   */
  static async isAvailableAtAll(id) {
    try {
      const availabilities = await this.getUnavailableDates(id);
      // console.log(id + " has length " + availabilities.length);
      return availabilities.length < (31 + 31 + 29);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Returns damage fee for stolen bike.
   * @param {int} id bike id
   */
  static async getDamageFee(id) {
    try {
      const sql = `SELECT damagefee FROM Bikes WHERE id=${id};`;
      const response = await database.query(sql);
      return response[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Return true if time is formatted correctly (YYYY-MM-DD).
   * @return {boolean}
   */
  static async isValidTime(time) {
    var bits = time.split('-');
    var t = new Date(bits[0], bits[1] - 1, bits[2]);
    return t && (t.getMonth() + 1) == bits[1];
  }

  /**
   * Update title of a Bike.
   * @param {string} id - id of Bike to update
   * @param {number} title - new title to update Bike
   * @return {Bike | undefined} - updated Bike
   */
  static async updateTitle(id, title) {
    try {
      const sql = `UPDATE Bikes SET title='${title}' WHERE id='${id}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update type of a Bike.
   * @param {string} id - id of Bike to update
   * @param {number} type - new type to update Bike
   * @return {Bike | undefined} - updated Bike
   */
  static async updateType(id, type) {
    try {
      const sql = `UPDATE Bikes SET type='${type}' WHERE id='${id}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update location of a Bike.
   * @param {string} id - id of Bike to update
   * @param {number} latitude - new latitude to update Bike
   * @param {number} longitude - new longitude to update Bike
   * @return {Bike | undefined} - updated Bike
   * @todo update availability
   */
  static async updateLocation(id, latitude, longitude) {
    try {
      const sql = `UPDATE Bikes SET latitude='${latitude}', longitude='${longitude}' WHERE id='${id}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update price of a Bike.
   * @param {string} id - id of Bike to update
   * @param {string} price - new price with which to update Bike
   * @param {string} timeframe- time frame to which new price applies
   * @return {Bike | undefined} - updated Bike
   */
  static async updatePrice(id, newPrice, timeframe) {
    try {
      const sql = `UPDATE Bikes SET ${timeframe}='${newPrice}' WHERE id='${id}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update image url of a Bike.
   * @param {string} id - id of Bike to update
   * @param {number} imageurl - new imageurl to update Bike
   * @return {Bike | undefined} - updated Bike
   */
  static async updateImageurl(id, imageurl) {
    try {
      const sql = `UPDATE Bikes SET url='${imageurl}' WHERE id='${id}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update damage fees for a Bike.
   * @param {string} id - id of Bike to update
   * @param {number} damageFee - new damage fees with which to update Bike
   * @return {Bike | undefined} - updated Bike
   */
  static async updateDamageFee(id, damageFee) {
    try {
      const sql = `UPDATE Bikes SET damagefee='${damageFee}' WHERE id='${id}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a Bike.
   * @param {string} id - id of Bike to delete
   * @return {Bike | undefined} - deleted Bike
   */
  static async deleteOne(id) {
    try {
      const bikeSql = `DELETE FROM Bikes WHERE id='${id}';`;
      const bikeResponse = await database.query(bikeSql);

      const availSql = `DELETE FROM Availability WHERE id='${id}'`;
      const availResponse = await database.query(availSql);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Bikes;
