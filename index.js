var io = require('socket.io-client'),
    Emitter = require('component-emitter');

var defaultUrl = 'https://push-broker.herokuapp.com';

function PushClient(options) {
  this.secret = options.secret;

  var self = this;
  var socket = this.socket = io(options.url, { multiplex: true });

  socket.on('connect', function () {
    self.setsecret(self.options.secret);
  });

  socket.on('PushEvent', function (data) {
    self.options.onpush(data);
  });
}

Emitter(PushClient.prototype);



PushClient.prototype.disconnect = function () {
  this.socket.disconnect();
};

PushClient.prototype.__secretCallback = function (secret) {
  this.options.onsecret(secret);
};

PushClient.prototype.setsecret = function (secret) {
  this.options.secret = secret;
  this.socket.emit('secret', secret, this.__secretCallback.bind(this));
};

module.exports.create = function (options) {
  var o = {};
  url = options.url || defaultUrl;
  secret = options.secret || '';

  var client = new PushClient({
    url: url,
    secret: secret,
    
  });
  return client;
}