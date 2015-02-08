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

socket.on('PushEvent', function (data) {
  log.info('PushEvent received: %s', data);

  var options = {
    url: CI_URL,
    headers: {
      'X-Github-Event': 'push'
    },
    form: {
      payload: data
    }
  };

  log.info('Sending PushEvent to CI...');
  request.post(options, function (err, res, body) {
    if (err)
      return log.error('CI error:', err);

    if (res.statusCode !== 200) {
      log.error('CI returned status code: %d', res.statusCode);
      log.error('body: %s', body);
      return;
    }

    log.info('Sent PushEvent to CI successfully.');
  });
});

socket.on('disconnect', function () {
  log.info('Socket.IO disconnected.');
});