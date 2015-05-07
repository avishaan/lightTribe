var logger = require('./../loggers/logger.js');
var async = require('async');

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

module.exports.readAllCommentsForPost = function (req, res, next) {
  var postId = req.swagger.params.postId.value;
  logger.info('Read all comments for post:' + postId);
  res.status(200).send([
    {
      _id: "100",
      text: "Comment 1 by a user",
      user: {
        username: "codeHatcher",
        thumbnail: "https://www.google.com/images/srpr/logo11w.png"
      }
    }, {
      _id: "101",
      text: "Comment 2 by a user",
      user: {
        username: "codeHatcher",
        thumbnail: "https://www.google.com/images/srpr/logo11w.png"
      }
    }
  ]);
};
