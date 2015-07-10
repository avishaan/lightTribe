var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var Image = require('./../models/image.js');
var Post = require('./../models/post.js');
var config = require('../config.js');
var fs = require('fs');
var cloudinary = require('cloudinary');
// config cloudinary
cloudinary.config(config.cloudinary);

module.exports.createReport = function createImage (req, res, next) {
  logger.info('file created');
  var _id = req.swagger.params.body.value._id;
  var resource = req.swagger.params.body.value.resource;
  if (resource && _id){
    res.status(200).send({});
  } else {
    res.status(500).send({clientMsg: "Incorrect parameters"});
  }
};
