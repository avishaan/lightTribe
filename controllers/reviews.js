var logger = require('./../loggers/logger.js');
var Review = require('../models/review.js');
var async = require('async');

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

module.exports.readAllReviews = function readReviews (req, res, next) {
  logger.info('Lookup All Reviews for user: ' + req.user.id);
  var allReviews;
  var reviewsWithImage= [];

  async.series([
  function(cb){
    // get the Reviews
    Review.readAllReviews({userId: req.user.id}, function(err, reviews){
      if (!err){
        allReviews = reviews;
        cb(null);
      } else {
        cb(err);
      }
    });
  },
  function(cb){
    //populate the images for the reviews
    async.each(allReviews, function(review, callback){
      Review.populate(review, {path: 'images'}, function(err, review){
        if (!err) {
          reviewsWithImage.push(review);
          callback(null);
        } else {
          callback(null);
        }
      });
    }, function(err){
      cb(err);
    });
  },
  function(cb){
    allReviews = reviewsWithImage.map(function(review){
      return review.toObject({ transform: hideProperties });
    });
    cb(null, allReviews);
  }
  ], function(err, results){
    if (!err){
      res.status(200).send(allReviews);
    } else {
      res.status(500).send(err);
    }
  });
  var hideProperties = function (doc, obj, options){
    // if ('function' == typeof doc.ownerDocument) {
    if (doc.url) {
      // working with image subdoc
      return {
        url: obj.url
      };
    } else {
      // working with doc
      return {
        _id: doc.id,
        description: obj.description,
        datetime: obj.datetime,
        company: obj.company,
        images: obj.images
      };
    }
  };
};
