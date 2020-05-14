const database = require('../database');

// id INT PRIMARY KEY auto_increment,
// rideid INT REFERENCES Rides(id),
// reviewer VARCHAR(30) REFERENCES Users(username),
// recipient VARCHAR(30) REFERENCES Bikes(id), 
// rating INT,
// text TEXT

/**
 * @class Reviews
 * Stores all Reviews.
 * Note that all methods are static.
 * Wherever you import this class, you will be accessing the same data.
 */
class Reviews {
  /**
   * Make a new Review.
   * @param {string} reviewer - review creator's username
   * @param {string} recipient - id of recipient entity (username or bike id)
   * @param {string} rating - number on a 5.0 scale
   * @param {string} text - string description
   * @return {Review} - created review
   */
  static async addOne(ride_id, username, recip_id, rating, text) {
    try {
      // insert into Reviews DB
      const sql = `INSERT INTO Reviews (rideid, reviewer, recipient, rating, text)
                   VALUES ('${ride_id}', '${username}', '${recip_id}', '${rating}', '${text}');`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a Review by Id.
   * @param {string} id - id of Review to find
   * @return {Review | undefined} - found Review
   */
  static async findOne(id) {
    try {
      const sql = `SELECT * FROM Reviews WHERE id='${id}';`;
      const response = await database.query(sql);
      return response[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all Reviews.
   * @return {Review[] | undefined} - found Review
   */
  static async findAll() {
    try {
      const sql = `SELECT * FROM Reviews;`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find Reviews created by reviewer.
   * @param {string} reviewer - username of reviewer
   * @return {Review[]} - found Reviews
   */
  static async findByReviewer(reviewer) {
    try {
      const sql = `SELECT * FROM Reviews WHERE reviewer='${reviewer}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find Reviews created for entity.
   * @param {string} entity_id - id of entity to find reviews for
   * @return {Review[]} - found Reviews
   */
  static async findForEntity(entity_id) {
    try {
      const sql = `SELECT * FROM Reviews WHERE recipient='${entity_id}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing Review.
   * @param {string} review_id - id of review to update
   * @param {string} new_rating - number on a 5.0 scale
   * @param {string} new_text - string description
   * @return {Review} - updated review
   */
  static async updateOne(review_id, new_rating, new_text) {
    try {
      const sql = (new_text.trim() !== '') ? 
        `UPDATE Reviews SET rating='${new_rating}' text='${new_text}' WHERE id='${review_id}';` : 
        `UPDATE Reviews SET rating='${new_rating}' WHERE id='${review_id}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Compute overall rating for entity based on Reviews.
   * @param {string} entity_id - id of entity to compute rating for
   * @return {Number} - overall rating
   */
  static async computeOverallRating(entity_id) {
    try {
      const sql = `SELECT * FROM Reviews WHERE recipient='${entity_id}';`;
      const reviews = await database.query(sql);
      if (reviews.length !== 0) {
        const now = new Date().toLocaleString();  // 11/16/2015, 11:18:48 PM
        var overall_rating = 0;
        var total_weight = 0;
        reviews.forEach(function(r) {
          var weight = Reviews.computeWeight(r.timestamp, now);
          overall_rating += weight * r.rating;
          total_weight += weight;
        });
        const rating = overall_rating / total_weight;
        return rating.toFixed(2);
      } else {
        return "N/A";
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Compute weight of Review based on time (for 
   * factoring into computation of overall rating).
   * @param {object} time - time at which review was made
   * @return {Number} - weight based on time
   */
  static computeWeight(time, now) {
    return 1;
  }

  /**
   * Delete a Review.
   * @param {string} id - id of Review to delete
   * @return {Review | undefined} - deleted Review
   */
  static async deleteOne(id) {
    try {
      const sql = `DELETE FROM Reviews WHERE id='${id}';`;
      const response = await database.query(sql);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Reviews;
