const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
//console.log('VAR1', process.env.DATABASE_URL)
const { errors } = require('celebrate');
const routes = require('./routes');

const app = express();

/* app.use(cors({
    origin: 'http://meuapp.com'  // Onde esta o frontend que vai poder acessar esse backend
})); */
app.use(cors());  // Todos frontend podem acessar.
app.use(express.json());
app.use(routes);
app.use(errors());

module.exports = app;
