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
  log.error('Please specify a secret with: --secret "your secret"')
  process.exit(1);
}

var client = pushclient.create({
  url: argv.url,
  secret: argv.secret,
  onsecret: function () {
    log.info('Secret has been set.');
  },
  onpush: function (data) {
    console.log('PushEvent received: %s', data);

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
});