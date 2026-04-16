// src/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./shared/middlewares/error.middleware');
const gateway = require('./gateway');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// All routes go through the gateway

app.use('/api', gateway);

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;