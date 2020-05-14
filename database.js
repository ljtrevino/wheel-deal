const mysql = require('mysql');

const config = {
  host: 'sql.mit.edu',
  user: 'nguyend',
  password: 'vig34kan',
  database: 'nguyend+wheeldeal',
};

class Database {
  constructor(dbConfig) {
    this.connection = mysql.createPool(dbConfig);
  }

  query(sql) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (err, rows) => {
        if (err) { return reject(err); }
        resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) { return reject( err ); }
        resolve();
      });
    });
  }

  async createTables() {
    console.log("making TABLES!\n");
    // Users -> username, password, name, phone
    await this.query(`CREATE TABLE IF NOT EXISTS Users(
      username VARCHAR(30) PRIMARY KEY,
      password VARCHAR(30), 
      name VARCHAR(50),
      phone CHAR(10),
      balance INT
    )`)
    .catch(err => console.log(err));

    // Bikes -> bike id, title, owner, type, location (lat, lon), price/time period, url, damage fees
    await this.query(`CREATE TABLE IF NOT EXISTS Bikes(
      id INT PRIMARY KEY auto_increment,
      title VARCHAR(50),
      owner VARCHAR(30) REFERENCES users(username), 
      type VARCHAR(8), 
      latitude DECIMAL(8,6),
      longitude DECIMAL(9,6),
      hourly DECIMAL(6,2),
      daily DECIMAL(6,2),
      weekly DECIMAL(6,2),
      monthly DECIMAL(6,2),
      url TEXT,
      damagefee INT
    )`)
    .catch(err => console.log(err));

    // Rides -> ride id, username, bike id, start time, end time, status
    // DATETIME is YYYY-MM-DD hh:mm:ss format
    await this.query(`CREATE TABLE IF NOT EXISTS Rides(
      id INT PRIMARY KEY auto_increment,
      user VARCHAR(30) REFERENCES Users(username),
      bikeid INT REFERENCES Bikes(id),
      start DATETIME,
      end DATETIME,
      status VARCHAR(10)
    )`)
    .catch(err => console.log(err));

    // Reviews -> review id, ride id, reviewer, recipient, rating, text
    await this.query(`CREATE TABLE IF NOT EXISTS Reviews(
      id INT PRIMARY KEY auto_increment,
      rideid INT REFERENCES Rides(id),
      reviewer VARCHAR(30) REFERENCES Users(username),
      recipient VARCHAR(30) REFERENCES Bikes(id), 
      rating INT,
      text TEXT,
      timestamp DATETIME
    )`)
    .catch(err => console.log(err));

    // Availability -> bike id, dates
    // FALSE if not available, TRUE if available
    let sql = `CREATE TABLE IF NOT EXISTS Availability(
      id INT REFERENCES Bikes(id)`;
    // Add December dates
    for (var day = 1; day <= 31; day++) { sql += `,\n12_${day} BOOL`; }
    // Add January dates
    for (var day = 1; day <= 31; day++) { sql += `,\n1_${day} BOOL`; }
    // Add February dates
    for (var day = 1; day <= 29; day++) { sql += `,\n2_${day} BOOL`; }
    sql += ")";

    await this.query(sql)
    .catch(err => console.log(err));
  }
}

const database = new Database(config);

module.exports = database;
