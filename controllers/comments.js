var logger = require('./../loggers/logger.js');
var Comment = require('./../models/comment.js');

var Promise = require('bluebird');
// convert built in functions to promises
Promise.promisifyAll(Comment);

module.exports.createComment = function (req, res, next) {
  // get the userid from the authenticated user, they are the one that submitted
  var author = req.user.id;
  var comment = req.swagger.params.comment.value;
  var postId = req.swagger.params.postId.value;
  comment.parent = postId;
  comment.author = author;

  Comment
  .createCommentAsync(comment)
  .then(function(comment){
    comment = comment.toJSON();
    res.status(200).send({
      _id: comment._id.toString()
    });
  })
  .catch(function(err){
    res.status(500).send(err);
  });
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
