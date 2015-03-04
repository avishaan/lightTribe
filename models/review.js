var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
var cloudinary = require('cloudinary');
var User = require('./../models/user.js');
var config = require('../config.js');
var async = require('async');

// config cloudinary
cloudinary.config(config.cloudinary);
/*
|-------------------------------------------------------------
| Image Schema
|-------------------------------------------------------------
*/

var imageSchema = new mongoose.Schema({
  url: { type: String },
  hosting: { type: String, default: 'cloudinary' },
  public_id: { type: String }
});

/**
 * Create a specific image
 * @param {object} options The options for the new image
 * @config {string} company of the image
 * @param {function} cb
 * @config {object} image 
 * @config {object} err Passed Error
 */
imageSchema.statics.createImage = function(options, cb) {
  // we are redefining the object to make sure other random stuff doesn't come through
  var image = {
    company: options.company,
    description: options.description,
    rating: options.rating,
    images: options.images,
    datetime: options.datetime,
    location: options.location,
    submitter: options.submitter
  };
  async.waterfall([
  function(done){
    //upload the image, if success then add to own database
    cloudinary.uploader.upload(req.files.file.path, function(result){
      if (!result.error){
        done(null, result.public_id);
      } else {
        done(result);
      }
    });
  },
  function(public_id, done){
    // add image to the database
    Image.create({ public_id: public_id }, function(err, savedImage){
      if (!err && savedImage){
        // we created the savedImage successfully
        done(null, savedImage);
      } else {
        done({err: err, clientMsg: 'Something broke, try again'}, null);
      }
    });
  }
  ], function(err, result){
    if (!err){
      cb(null, result);
    } else {
      logger.error(err);
      cb(err);
    }
  });


};
/**
 * Read a specific image
 * @param {object} options The options for the lookup
 * @config {string} image id of the image
 * @param {function} cb
 * @config {object} image 
 * @config {object} err Passed Error
 */
imageSchema.statics.readImage = function(options, cb) {
  var id = options.id;
  // see if image exists, if so pass error
  Image.findOne({_id: id}, function(err, image){
    if (!err){
      cb(null, image);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

var Image = mongoose.model('Image', imageSchema);

module.exports = Image;

