var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var Image = require('./../models/image.js');
var config = require('../config.js');
var fs = require('fs');
var cloudinary = require('cloudinary');
// config cloudinary
cloudinary.config(config.cloudinary);

module.exports.createImage = function createImage (req, res, next) {
  debugger;
  logger.info('file created');
  if (req.files && req.files.file && req.files.file.size) {
    Image.createImage(req, function(err, image){
      if (!err){
        res.status(200).send(image);
      } else {
        res.status(500).send(err);
      }
    });
  } else {
    res.status(400).send({clientMsg: "Need to upload a file"});
  }
};
module.exports.readImageURL = function readImageURL (req, res, next) {
  logger.info('return url');
  var url = cloudinary.url(req.swagger.params.iid.value)
  res.status(200).send({clientMsg: "Image URL", url: url});
};
