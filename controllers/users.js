var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');

module.exports.registerUser = function registerUser (req, res, next) {
  logger.info('registerUser');
  res.status(200).send('ok');
};
