var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
/*
|-------------------------------------------------------------
| Post Schema
|-------------------------------------------------------------
*/

var postSchema = new mongoose.Schema({
  text: { type: String },
  datetime: { type: Date },
  geometry: { // based on GeoJSON
    type: {
      type: String, default: "Point"
    },
    coordinates: [ Number ]
  },
  images: [
    { type: String, ref: 'Image' }
  ],
  author: { type: String, ref: 'User' },
});

/**
 * Create a specific post
 * @param {object} options The options for the new post
 * @config {string} company of the post
 * @param {function} cb
 * @config {object} post 
 * @config {object} err Passed Error
 */
postSchema.statics.createPost = function(options, cb) {
  // we are redefining the object to make sure other random stuff doesn't come through
  var post = {
    text: options.text,
    datetime: Date.now(),
    author: options.author,
    images: options.images,
    geometry: {
      type: "Point",
      coordinates:[options.longitude, options.latitude]
    },
  };

  // add post to the database
  Post.create(post, function(err, savedPost){
    if (!err && savedPost){
      // we created the savedPost successfully
      cb(null, savedPost);
    } else {
      logger.error(err);
      cb(err);
    }
  });
};
/**
 * Read a specific post
 * @param {object} options The options for the lookup
 * @config {string} post id of the post
 * @param {function} cb
 * @config {object} post 
 * @config {object} err Passed Error
 */
postSchema.statics.readPost = function(options, cb) {
  var id = options.id;
  // see if post exists, if so pass error
  Post.findOne({_id: id}, function(err, post){
    if (!err){
      cb(null, post);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

/**
 * Read all posts for a user
 * @param {object} options The options for the lookup
 * @config {string} options.userId user id of the user for which you want posts
 * @param {function} cb
 * @config {object} posts
 * @config {object} err Passed Error
 */
postSchema.statics.readAllPosts = function(options, cb) {
  // see if post exists, if so pass error
  Post
  .find({submitter: options.userId})
  //.populate('images')
  .exec(function(err, posts){
    if (!err){
      cb(null, posts);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

var Post = mongoose.model('Post', postSchema);

module.exports = Post;

