var logger = require('./../loggers/logger.js');
var io = require('socket.io');

module.exports.init = function(server) {
  // return the io for use
  return require('socket.io')(server);
};

module.exports.io = io();
