var logger = require('./../loggers/logger.js');
var Review = require('../models/review.js');
var async = require('async');

var Promise = require('bluebird');
Promise.promisifyAll(Review);

module.exports.createPost = function (req, res, next) {
  var post = req.swagger.params.post.value;
  // get the userid from the authenticated user, they are the one that submitted
  post.author = req.user.id;
  res.status(200).send({
    _id: "123",
    text: post.text,
    images: post.images,
    latitude: post.latitude,
    longitude: post.longitude,
    author: post.author
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

module.exports.readAllPosts = function readReviews (req, res, next) {
  logger.info('Lookup All posts relavent to user: ' + req.user.id);
  res.status(200).send([
    {
      _id: "100",
      text: "Post 1",
      createDate: Date.now(),
      user: {
        username: "codeHatcher",
        thumbnail: "https://www.google.com/images/srpr/logo11w.png"
      }
    }
  ]);
};
