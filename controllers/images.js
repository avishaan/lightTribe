var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');

module.exports.createImage = function createImage (req, res, next) {
  logger.info('file created');
  res.status(200).send('ok');
};
module.exports.readImage = function readImage (req, res, next) {
  logger.info('file read');
  res.status(200).send('ok');
};
