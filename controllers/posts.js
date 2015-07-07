var logger = require('./../loggers/logger.js');
var Review = require('../models/review.js');
var Post = require('../models/post.js');
var Image = require('../models/image.js');
var async = require('async');

var Promise = require('bluebird');
Promise.promisifyAll(Post);

module.exports.createPost = function (req, res, next) {
  var post = req.swagger.params.post.value;
  // get the userid from the authenticated user, they are the one that submitted
  post.author = req.user.id;
  // save the post
  Post
  .createPostAsync(post)
  .then(function(savedPost){
    var post = savedPost.toJSON();
    res.status(200).send({
      _id: post._id,
      text: post.text,
      images: post.images,
      interests: post.interests,
      author: post.author
    });
  })
  .catch(function(err){
    res.status(500).send(err);
  });
};

module.exports.readAllUsersInPost = function (req, res, next) {
  var postId = req.swagger.params.postId.value;
  logger.info('Read all users in post:' + postId);
  res.status(200).send([
    {
      _id: "100",
      user: {
        username: "codehatcher",
        lastLogin: Date.now(),
        thumbnail: "https://www.google.com/images/srpr/logo11w.png"
      }
    }, {
      _id: "101",
      user: {
        username: "codehatcher",
        lastLogin: Date.now(),
        thumbnail: "https://www.google.com/images/srpr/logo11w.png"
      }
    }
  ]);
};

module.exports.readAllPostsByUser = function (req, res, next) {
  var userId = req.swagger.params.userId.value;
  logger.info('Read all posts by user:' + userId);
  Post
  .find({ author: userId })
  .select('createDate text author')
  .lean()
  .exec(function(err, posts){
    if (!err) {
      res.status(200).send(posts);
    } else {
      res.status(500).send({
        clientMsg: "Could not get posts for you :(",
        err: err
      });
    }
  });
};

module.exports.readOnePost = function (req, res, next) {
  var postId = req.swagger.params.postId.value;
  logger.info('Read specific post: ' + postId);
  Post
  .findOne({ _id: postId })
  .select('createDate text author images')
  .populate({
    path: 'author',
    select: 'username userImage lastLogin _id'
  })
  .populate({
    path: 'images',
    select: 'url'
  })
  .lean()
  .exec(function(err, post){
    if (!err) {
      res.status(200).send(post);
    } else {
      res.status(500).send({
        clientMsg: "Could not find that specific post :(",
        err: err
      });
    }
  });
};

module.exports.readRelevantPosts = function (req, res, next) {
  var options = {
    longitude: req.swagger.params.longitude.value,
    latitude: req.swagger.params.latitude.value,
    radius: req.swagger.params.radius.value,
    page: req.swagger.params.page.value
  };
  logger.info('Search posts based on incoming query parameters: ');
  Post.readPostsBySearch(options, function(err, posts){
    if (!err){
      var opts = [
        { path: 'author.userImage', select: 'url' }
      ];
      // populate the images of the authors
      Image.populate(posts, opts, function(err, posts){
        if (!err){
          res.status(200).send(posts);
        } else {
          err.clientMsg = "Could not populate userImage";
          res.status(500).send(err);
        }
      });
    } else {
      err.clientMsg = "Couldn't perform search :(";
      res.status(500).send(err);
    }
  });
  //res.status(200).send([
  //  {
  //    _id: "100",
  //    text: "Post 1",
  //    createDate: Date.now(),
  //    user: {
  //      username: "codeHatcher",
  //      thumbnail: "https://www.google.com/images/srpr/logo11w.png"
  //    }
  //  }, {
  //    _id: "101",
  //    text: "Post 2",
  //    createDate: Date.now(),
  //    user: {
  //      username: "codeHatcher",
  //      thumbnail: "https://www.google.com/images/srpr/logo11w.png"
  //    }
  //  }
  //]);
};
