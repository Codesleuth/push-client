#!/usr/bin/env node

var log = require('../logger'),
    pushclient = require('../index'),
    request = require('request'),
    minimist = require('minimist');

var argv = minimist(process.argv.slice(2), {
  string: 'secret',
  default: {
    secret: false,
    url: 'https://push-broker.herokuapp.com'
  }
});

if (!argv.secret) {
  log.error('Please specify a secret with: --secret "your secret"');
  process.exit(1);
}

function secretHandler(secret) {
  log.info('Secret has been set to "%s"', secret);
}

function pushHandler(data) {
  log.info('PushEvent received: ', data.headers['X-Github-Delivery']);

  var options = {
    url: 'http://localhost:3000/pushed-it',
    headers: {
      'X-Github-Event'    : 'push',
      'X-Github-Delivery' : data.headers['X-Github-Delivery'],
      'X-Hub-Signature'   : data.headers['X-Hub-Signature'],
      'User-Agent'        : data.headers['User-Agent']
    },
    form: {
      payload: data.body
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
}

var client = pushclient.create({
  url: argv.url,
  secret: argv.secret,
  onsecret: secretHandler,
  onpush: pushHandler
});

log.info('Connecting to %s...', argv.url);
client.connect();

var socket = client.socket;

socket.on('connect', function () {
  log.info('Socket.IO Connected.');
});

socket.on('connect_error', function (err) {
  log.error('Socket.IO connect error: ' + err.message);
});

socket.on('connect_timeout', function () {
  log.info('Socket.IO connect timeout.');
});

socket.on('disconnect', function () {
  log.info('Socket.IO disconnected.');
});

socket.on('reconnect_attempt', function () {
  log.info('Socket.IO reconnect attempt starting...');
});

socket.on('reconnecting', function (num) {
  log.info('Socket.IO reconnecting (' + num + ') ...');
});

socket.on('reconnect_error', function (err) {
  log.info('Socket.IO reconnect error: ' + err.message);
});

socket.on('reconnect_failed', function () {
  log.info('Socket.IO failed to reconnect within ' + socket.io.reconnectionAttempts + ' attempts.');
});

socket.on('reconnect', function () {
  log.info('Socket.IO reconnected.');
});
