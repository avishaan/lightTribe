var logger = require('./../loggers/logger.js');
var Review = require('../models/review.js');
var async = require('async');

var Promise = require('bluebird');
Promise.promisifyAll(Review);

module.exports.readOneProfile = function (req, res, next) {
  var userId = req.swagger.params.userId.value;
  logger.info('Lookup profile for user: ' + userId);
  res.status(200).send({
    _id: "123",
    categories: {
      yoga: 10,
      meditation: 50,
      dancing: 11,
      healing: 70
    },
    user: {
      username: "codeHatcher",
      thumbnail: "http://www.google.com/image.png",
      lastLogin: Date.now()
    }
  });
  // Review
  // .createReviewAsync(review)
  // .then(function(review){
  //   res.status(200).send(review);
  // })
  // .catch(function(err){
  //   res.status(500).send(err);
  // });
};
