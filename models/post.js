var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
var utils = require('./../utils/circleToPolygon.js');
/*
|-------------------------------------------------------------
| Post Schema
|-------------------------------------------------------------
*/

var postSchema = new mongoose.Schema({
  text: { type: String },
  createDate: { type: Date },
  loc: { // based on GeoJSON
    type: {
      type: String, default: "MultiPoint"
    },
    coordinates: []
  },
  images: [
    { type: String, ref: 'Image' }
  ],
  author: { type: String, ref: 'User' },
});

postSchema.index({loc: '2dsphere'});

/**
 * Create a specific post
 * @param {object} options The options for the new post
 * @config {string} company of the post
 * @param {function} cb
 * @config {object} post 
 * @config {object} err Passed Error
 */
postSchema.statics.createPost = function(options, cb) {
  // convert coordinates to polygon so that we can cover an area
  var polyCoordinates = utils.circleToPolygon({
    latitude: options.latitude,
    longitude: options.longitude,
    radius: 1, // 1km
    sides: 12
  });
  // we are redefining the object to make sure other random stuff doesn't come through
  var post = {
    text: options.text,
    createDate: Date.now(),
    author: options.author,
    images: options.images,
    loc: {
      type: "MultiPoint",
      coordinates: polyCoordinates
    }
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

  //helper function takes point and radius and converts to GeoJSON compatible polygon that roughly approximates a circle

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
 * Read relevant post based on query parameters search
 * @param {object} options The options for the lookup
 * @config {number} options.longitude longitude of the search for posts in that area using WGS84 guidelines 
 * @config {number} options.latitude latitude of the search for posts in that area using WGS84 guidelines
 * @config {number} options.distance in units of meters assuming geoJSON guidelines
 * @param {function} cb
 * @config {object} posts
 * @config {object} err Passed Error
 */
postSchema.statics.readPostsBySearch = function(options, cb) {
  // see if post exists, if so pass error
  var coordinates = [options.longitude, options.latitude];
  var distance = options.distance; // km
  var earthRadius = 6371; // km
  Post
  .find({})
  .where('loc')
  .near({
    center: coordinates,
    spherical: true,
    maxDistance: distance/earthRadius
  })
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

