var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');

module.exports.createImage = function createImage (req, res, next) {
  logger.info('file created');
  if (req.files && req.files.file && req.files.file.size) {
    // we have a file, upload it to cloudinary
    res.status(200).send('ok');
  } else {
    res.status(400).send({clientMsg: "No file found"});
  }
};
module.exports.readImage = function readImage (req, res, next) {
  logger.info('file read');
  res.status(200).send('ok');
};
