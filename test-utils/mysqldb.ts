const mysql = require('mysql2');

// import dotenv from 'dotenv';

const DB_HOST = process.env.DB_HOST || 'pst-db';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const DB_USER = process.env.DB_USER;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PASSWORD = process.env.DB_PASSWORD;

const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log(DB_HOST);
console.log(DB_PORT);
console.log(DB_USER);
console.log(DB_PASSWORD);
console.log(DB_DATABASE);

module.exports = pool.promise(); // Use promise-based API for async/await support