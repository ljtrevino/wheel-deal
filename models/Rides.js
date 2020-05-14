const database = require('../database');
const Bikes = require('./Bikes');

/**
 * id INT PRIMARY KEY auto_increment,
 * user VARCHAR(30) REFERENCES Users(username),
 * bikeid INT REFERENCES Bikes(id),
 * start DATETIME,
 * end DATETIME,
 * status VARCHAR(10)
 */

 /**
  * Ride Statuses
  * cancelled - cancelled
  * reserved - just reserved
  * arrived - rider got to the bike, "starting" the ride process
  * riding - owner confirmed bike exchange, can start using bike
  * finished - rider returned bike, "finished" their ride
  * returned - owner confirmed bike is was returned
  */

const nextStatusDict = {
    "reserved" : "arrived",
    "arrived"  : "riding",
    "riding"   : "finished",
    "finished" : "returned",
    "returned" : "reviewed"
}

class Rides {
    // Create a ride
    static async create(username, bikeid, start, end) {
        try {
            const sql = `INSERT INTO Rides (user, bikeid, start, end, status) 
                            VALUES ('${username}', '${bikeid}', '${start}', '${end}', 'reserved');`;
            const response = await database.query(sql);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Cancel the ride
    static async cancelRide(id) {
        try {
            const sql = `UPDATE Rides SET status='cancelled' WHERE id='${id}';`;
            const response = await database.query(sql);
            
            // add the availability back to the bike
            let data = await this.getRideForID(id);
            data = data[0];

            const start = data['start'].getYear() + "-" + (data['start'].getMonth()+1) + "-" + data['start'].getDate();
            const end = data['end'].getYear() + "-" + (data['end'].getMonth()+1) + "-" + data['end'].getDate();
            const bike = data['bikeid'];
            const availRes = await Bikes.addAvailability(bike, start, end);

            return [response, availRes];
        } catch (error) {
            throw error;
        }
    }

    static async useRide(id) {
        try {
            const sql = `UPDATE Rides SET status='finished' WHERE id='${id}';`;
            const response = await database.query(sql);
            return response;
        } catch (error) {
            throw error;
        }    
    }

    static async stolenRide(id) {
        try {
            const sql = `UPDATE Rides SET status='stolen' WHERE id='${id}';`;
            const response = await database.query(sql);
            return response;
        } catch (error) {
            throw error;
        }    
    }

    // update the status to the next ride step
    static async advanceRideStatus(id) {
        try {
            const status = await this.getRideStatus(id);
            const newStatus = nextStatusDict[status];
            const sql = `UPDATE Rides SET status='${newStatus}' WHERE id='${id}';`;
            const response = await database.query(sql);
            return response;
        } catch (error) {
            throw error;
        }   
    }

    static async getRidesForUser(username) {
        try {
            const sql = `SELECT * FROM Rides WHERE user='${username}'`;
            const response = await database.query(sql);
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async getRidesForOwner(username) {
        try {
            const bikes = await Bikes.findForOwner(username);
            const ids = bikes.map(bike => {
                return bike['id'];
            });

            var sql = `SELECT * FROM Rides WHERE bikeid IN (`;
            ids.forEach(id => { sql += `'${id}', `});
            sql = sql.slice(0, -2) + ");";
            const response = await database.query(sql);
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    static async getRideForID(id) {
        try {
            const sql = `SELECT * FROM Rides WHERE id='${id}'`;
            const response = await database.query(sql);
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async getRideStatus(id) {
        try {
            var ride = await this.getRideForID(id);
            ride = ride[0];
            const status = ride['status'];
            return status;
        } catch (error) {
            throw error;
        }   
    }
}

module.exports = Rides;