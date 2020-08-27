const knex = require('knex');
const configuration = require('../../knexfile');

const { Pool, Client } = require('pg');
//const connectionString = 'postgresql://dbuser:secretpassword@database.server.com:3211/mydb'
const connectionString = process.env.DATABASE_URL;

const connection_pg = new Client({
    connectionString: connectionString,
})

module.exports = connection_pg;