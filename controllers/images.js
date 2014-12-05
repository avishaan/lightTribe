var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');
var fs = require('fs');
var cloudinary = require('cloudinary');
// config cloudinary
cloudinary.config(config.cloudinary);

module.exports.createImage = function createImage (req, res, next) {
  logger.info('file created');
  if (req.files && req.files.file && req.files.file.size) {
    // we have a file, upload it to cloudinary
    // TODO upload as stream to save space and increase speed
    cloudinary.uploader.upload(req.files.file.path, function(result){
      res.status(200).send({
        _id: result.public_id
      });
    });
  } else {
    res.status(400).send({clientMsg: "No file found"});
  }
};
module.exports.readImage = function readImage (req, res, next) {
  logger.info('file read');
  res.status(200).send('ok');
};
