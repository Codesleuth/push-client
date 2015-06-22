var wdw = typeof window === 'undefined' ? {} : window;
var io = wdw.io || require('socket.io-client');

var defaultUrl = 'https://push-broker.herokuapp.com';

function ConnectClient(url, secret, onpush, onsecret) {
  var socket = io(url, { multiplex: true });

  socket.on('connect', function () {
    socket.emit('secret', secret, function () {
      onsecret(secret);
    });
  })

  socket.on('PushEvent', function (data) {
    onpush(data);
  });

  this.socket = socket;
};

function PushClient() {
}

PushClient.prototype.disconnect = function () {
  this.socket.disconnect();
};

PushClient.prototype.setsecret = function (secret) {
  this.socket.emit('secret', secret);
};


module.exports.create = function (options) {
  options = options || {};
  url = options.url || defaultUrl;
  secret = options.secret || '';
  onpush = options.onpush || function () {};
  onsecret = options.onsecret || function () {};

  var client = new PushClient();
  ConnectClient.call(client, url, secret, onpush, onsecret);
  return client;
}