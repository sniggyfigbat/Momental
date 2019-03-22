const moment = require('moment');

// Middleware example
const logger = (req, res, next) => {
	console.log(`${moment().format()}: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
	next();
}

module.exports = logger;