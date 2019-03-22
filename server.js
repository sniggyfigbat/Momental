const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const express = require('express');
const path = require('path');

const logger = require('./server/logger');

// Init express
const app = express();

// Init middleware
//app.use(logger);
app.use(express.json()); // Body parser middleware.
app.use(express.urlencoded({ extended: false }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/levels', require('./server/routes/api/levels'));

// Listen on a port
const PORT = process.env.port || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}.`));