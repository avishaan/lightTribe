var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
var utils = require('./../utils/circleToPolygon.js');
var Post = require('./../models/post.js');
var apns = require('./../notifications/apns.js');
var apn = require('apn');
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

// after comment is saved, notifiy correct users
 commentSchema.post('save', function(comment){
   // find original post
   Post
   .findOne({_id: comment.parent })
   .populate('author')
   .exec(function(err, post){
     if (!err && post && post.author.devices.length){
       var devices = post.toJSON().author.devices;
       devices.forEach(function(device){
         if (device.platform === 'ios'){
           // send notification to the ios device
           var note = new apn.Notification();
           note.badge = 0;
           note.alert = "Someone commented on your post!";
           note.payload = {
             comment: {
               _id: comment.id,
               text: comment.text
             }
           };
           apns.service.pushNotification(note, device.token);
         }
       });
     }
   });
   // find author of original post
   // send notification to all devices of that author
 });
/**
 * Create a specific comment
 * @param {object} options The options for the new comment
 * @property {string} text body of the comment
 * @property {date} createDate date comment happened
 * @property {string} author user who created the comment
 * @property {string} parent the parent post for the comment
 * @param {function} cb
 * @property {object} comment that was just saved
 * @property {object} err Passed Error
 */
commentSchema.statics.createComment = function(options, cb) {
  // we are redefining the object to make sure other random stuff doesn't come through
  var comment = {
    text: options.text,
    createDate: Date.now(),
    author: options.author,
    parent: options.parent
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
 * Read all comments for a specific post
 * @param {object} options The options for the lookup of the post
 * @property {string} options.postId post id of the user for which you want comments
 * @param {function} cb
 * @property {object} comments
 * @property {object} err Passed Error
 */
commentSchema.statics.readAllCommentsForPost = function(options, cb) {
  var maxResults = options.maxResults || 50;
  var postId = options.postId;
  var page = options.page;
  // see if comment exists, if so pass error
  Comment
  .find({ parent: postId })
  .limit(maxResults)
  .skip((page - 1) * maxResults)
  .populate({
    path: 'author',
    select: 'username'
  })
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

