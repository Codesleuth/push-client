var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      timestamp: true,
      handleExceptions: true,
      colorize: true
    })
  ],
  exitOnError: false
});

module.exports = logger;