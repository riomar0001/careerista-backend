import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST, 
  user: process.env.DATABASE_USERNAME, 
  password: process.env.DATABASE_PASSWORD | "", 
  database: process.env.DATABASE_NAME,  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export a promise-based pool
export const db = pool.promise();
