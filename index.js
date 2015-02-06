var log = (function () {
  var winston = require('winston');
  return new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'debug', colorize: true })
      //,new (winston.transports.File)({ filename: 'somefile.log' })
    ]
  });
})();

var PUSH_PROXY_URL = process.env.PUSH_PROXY_URL || 'localhost:3000';
var JENKINS_URL = process.env.JENKINS_URL || 'localhost:3001';

log.info('Socket.IO connecting to %s...', PUSH_PROXY_URL);
var socket = require('socket.io-client')(PUSH_PROXY_URL),
    request = require('request');

socket.on('connect', function (socket) {
  log.info('Socket.IO connected.');
});

socket.on('payload', function (data) {
  log.info('Payload received: %s', data);

  var options = {
    url: JENKINS_URL,
    headers: {
      'X-Github-Event': 'push'
    },
    form: {
      payload: data
    }
  };

  log.info('Forwarding on payload...');
  request.post(options, function (err, res, body) {
    if (err)
      return log.error('Forwarding error:', err);

    if (res.statusCode !== 200) {
      log.error('Forwarding returned status code: %d', res.statusCode);
      log.error('body: %s', body);
      return;
    }

    log.info('Forwarding complete.');
  });
});

socket.on('disconnect', function () {
  log.info('Socket.IO disconnected.');
});