var querystring = require('querystring');
var logger = require('./../loggers/logger.js');
var config = require('../config.js');
var Review = require('../models/review.js');

var Promise = require('bluebird');
Promise.promisifyAll(Review);

module.exports.createReview = function createReview (req, res, next) {
  var review = req.swagger.params.review.value;
  // get the userid from the authenticated user, they are the one that submitted
  review.submitter = req.user.id;
  Review
  .createReviewAsync(review)
  .then(function(review){
    res.status(200).send(review);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
};

module.exports.readReview = function readReview (req, res, next) {
  var rid = req.swagger.params.rid.value;
  logger.info('Lookup Review ' + rid);
  // get the Review
  Review.readReview({id: rid}, function(err, review){
    if (!err){
      res.status(200).send(review);
    } else {
      res.status(500).send(err);
    }
  });
};
