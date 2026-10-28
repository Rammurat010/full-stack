const mysql = require("mysql2/promise");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function connectDB() {
  const connection = await db.getConnection();

  try {
    await connection.ping();
    console.log("MySQL connected successfully!");
  } finally {
    connection.release();
  }
}

module.exports = { db, connectDB };
