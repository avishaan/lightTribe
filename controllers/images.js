var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var Image = require('./../models/image.js');
var config = require('../config.js');
var fs = require('fs');
var cloudinary = require('cloudinary');
// config cloudinary
cloudinary.config(config.cloudinary);

module.exports.createImage = function createImage (req, res, next) {
  logger.info('file created');
  if (req.files && req.files.file && req.files.file.size) {
    Image.createImage(req.files, function(err, image){
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
  var iid = req.swagger.params.iid.value;
  logger.info('return url');
  // find image id
  Image
  .findOne({_id: iid })
  .select ('_id url')
  .lean()
  .exec(function(err, image){
    if (!err){
      res.status(200).send(image);
    } else {
      res.status(500).send(err);
    }
  });
};
