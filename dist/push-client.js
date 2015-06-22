(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pushclient = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

PushClient.prototype.disconnect = function() {
  this.socket.disconnect();
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
},{"socket.io-client":undefined}]},{},[1])(1)
});