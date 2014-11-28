var querystring = require('querystring');
var logger = require('./../loggers/logger.js');
var config = require('../config.js');
var Review = require('../models/review.js');

module.exports.createReview = function createReview (req, res, next) {
  var review = req.swagger.params.review.value;
  Review.createReview(review, function(err, review){
    if (!err){
      res.status(200).send(review);
    } else {
      res.status(500).send(err);
    }
  });
};

module.exports.readReview = function readReview (req, res, next) {
  var rid = req.swagger.params.rid.value;
  logger.info('Lookup user ' + rid);
  // make sure to unescape any characters
  rid = querystring.unescape(rid);
  // get the user measurements
  User.getMeasurements({phone: rid}, function(err, measurements){
    if (!err){
      res.status(200).send(measurements);
    } else {
      res.status(500).send(err);
    }
  });
};
