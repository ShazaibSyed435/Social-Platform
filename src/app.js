const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./shared/middlewares/error.middleware');
const gateway = require('./gateway');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Request Logger
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// All routes go through gateway
app.use('/api', gateway);

// Global error handler
app.use(errorHandler);

module.exports = app;

