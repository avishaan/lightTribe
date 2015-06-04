var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
var utils = require('./../utils/circleToPolygon.js');
/*
|-------------------------------------------------------------
| Comment Schema
|-------------------------------------------------------------
*/

var commentSchema = new mongoose.Schema({
  text: { type: String },
  createDate: { type: Date, default: Date.now },
  author: { type: String, ref: 'User' },
  parent: { type: String, ref: 'Post' }, // parent post the comment belongs to
});
/**
 * Create a specific comment
 * @param {object} options The options for the new comment
 * @property {string} text body of the comment
 * @property {date} createDate date comment happened
 * @property {string} author user who created the comment
 * @param {function} cb
 * @property {object} comment that was just saved
 * @property {object} err Passed Error
 */
commentSchema.statics.createComment = function(options, cb) {
  // we are redefining the object to make sure other random stuff doesn't come through
  var comment = {
    text: options.text,
    createDate: Date.now(),
    author: options.author
  };
  // add comment to the database
  Comment.create(comment, function(err, savedComment){
    if (!err && savedComment){
      // we created the savedComment successfully
      cb(null, savedComment);
    } else {
      logger.error(err);
      cb(err);
    }
  });
};
/**
 * Read a specific comment
 * @param {object} options The options for the lookup
 * @config {string} comment id of the comment
 * @param {function} cb
 * @config {object} comment 
 * @config {object} err Passed Error
 */
commentSchema.statics.readComment = function(options, cb) {
  var id = options.id;
  // see if comment exists, if so pass error
  Comment.findOne({_id: id}, function(err, comment){
    if (!err){
      cb(null, comment);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

/**
 * Read relevant comment based on query parameters search
 * @param {object} options The options for the lookup
 * @config {number} options.longitude longitude of the search for comments in that area using WGS84 guidelines 
 * @config {number} options.latitude latitude of the search for comments in that area using WGS84 guidelines
 * @config {number} options.distance in units of meters assuming geoJSON guidelines
 * @param {function} cb
 * @config {object} comments
 * @config {object} err Passed Error
 */
commentSchema.statics.readCommentsBySearch = function(options, cb) {
  // see if comment exists, if so pass error
  var coordinates = [options.longitude, options.latitude];
  var distance = options.distance; // km
  var earthRadius = 6371; // km
  Comment
  .find({})
  .where('loc')
  .near({
    center: coordinates,
    spherical: true,
    maxDistance: distance/earthRadius
  })
  //.populate('images')
  .exec(function(err, comments){
    if (!err){
      cb(null, comments);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};
/**
 * Read all comments for a user
 * @param {object} options The options for the lookup
 * @config {string} options.userId user id of the user for which you want comments
 * @param {function} cb
 * @config {object} comments
 * @config {object} err Passed Error
 */
commentSchema.statics.readAllComments = function(options, cb) {
  // see if comment exists, if so pass error
  Comment
  .find({submitter: options.userId})
  //.populate('images')
  .exec(function(err, comments){
    if (!err){
      cb(null, comments);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

