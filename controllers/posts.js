var logger = require('./../loggers/logger.js');
var Review = require('../models/review.js');
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Image = require('../models/image.js');
var Comment = require('../models/comment.js');
var async = require('async');
var _ = require('underscore');

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
      author: post.author,
      privacy: post.privacy,
      postType: post.postType
    });
  })
  .catch(function(err){
    res.status(500).send(err);
  });
};

module.exports.readAllUsersInPost = function (req, res, next) {
  var postId = req.swagger.params.postId.value;
  var page = req.swagger.params.page.value;

  var maxResults = 40;

  logger.info('Read all users in post:' + postId);

  // find the comments for a matching post
  // select the participants
  // populate the participants
  // lean it up
  Comment
  .find({ parent: postId })
  .sort('createDate')
  .select('author')
  .populate({
    path: 'author',
    select: 'username userImage'
  })
  .limit(maxResults)
  .skip((page - 1) * maxResults)
  .lean()
  .exec(function(err, comments){
    var authors = comments.map(function(comment){
      return comment.author;
    });
    // get a unique list of authors by removing the dups
    authors = _.uniq(authors);
    // populate the images
    Image
    .populate(authors, {
      path: 'userImage',
      select: 'url'
    })
    .onResolve(function(err, authors){
      if (!err) {
        res.status(200).send(authors);
      } else {
        res.status(500).send({err: err, clientMsg: "Something broke :("});
      }
    });
  });
};

module.exports.readAllPostsByUser = function (req, res, next) {

  var maxResults = 25;

  var userId = req.swagger.params.userId.value;
  var page = req.swagger.params.page.value;

  logger.info('Read all posts by user:' + userId);
  Post
  .find({ author: userId })
  .select('createDate text author')
  .limit(maxResults)
  .skip((page -1) * maxResults)
  .populate({
    path: 'author',
    select: 'userImage'
  })
  .populate({
    path: 'author.userImage',
    select: 'url'
  })
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
