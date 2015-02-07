var log = require('./logger.js'),
    socketClient = require('socket.io-client'),
    request = require('request');

var PUSH_PROXY_URL = process.env.PUSH_PROXY_URL || 'http://localhost:3000';
var CI_URL = process.env.CI_URL || 'http://localhost:3001';

log.info('Socket.IO connecting to %s...', PUSH_PROXY_URL);
var socket = socketClient(PUSH_PROXY_URL);

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