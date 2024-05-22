const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: "",
  database: 'attendance_db',
  multipleStatements: true
})

module.exports = pool