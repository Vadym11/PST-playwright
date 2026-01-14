import mysql from 'mysql2/promise'; // Import the promise version directly

const MYSQL_HOST = process.env.MYSQL_HOST || 'pst-db';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306');
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;

const pool = mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
// module.exports = pool.promise(); // Use promise-based API for async/await support