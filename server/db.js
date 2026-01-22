
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,

   ssl: process.env.PG_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// const pool = new Pool({
//   user: 'postgres',
//   host:'localhost',
//   database: 'pavan_db',
//   password: '12345678',
//   port: '5432',
// });

module.exports = {
  query: (text, params) => pool.query(text, params),
  // Method to get a client from the pool for transactions
  getClient: () => pool.connect(),
  // Expose the pool for the seeder to manage connections
  pool: pool 
};
