var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
var Conversation = require('./../models/conversation.js');
/*
|-------------------------------------------------------------
| Message Schema
|-------------------------------------------------------------
*/

var messageSchema = new mongoose.Schema({
  text: { type: String },
  createDate: { type: Date, default: Date.now },
  author: { type: String, ref: 'User' },
  parent: { type: String, ref: 'Conversation' }, // parent post the message belongs to
});

/**
 * Create a specific message
 * @param {object} options The options for the new message
 * @property {string} text body of the message
 * @property {date} createDate date message happened
 * @property {string} author user who created the message
 * @property {string} parent the parent post for the message
 * @param {function} cb
 * @property {object} message that was just saved
 * @property {object} err Passed Error
 */
messageSchema.statics.createMessage = function(options, cb) {
  // we are redefining the object to make sure other random stuff doesn't come through
  var message = {
    text: options.text,
    createDate: Date.now(),
    author: options.author,
    parent: options.parent
  };
  // add message to the database
  Message.create(message, function(err, savedMessage){
    if (!err && savedMessage){
      // we created the savedMessage successfully
      cb(null, savedMessage);
    } else {
      logger.error(err);
      cb(err);
    }
  });
};
/**
 * Read all messages for a specific post
 * @param {object} options The options for the lookup of the post
 * @property {string} options.postId post id of the user for which you want messages
 * @param {function} cb
 * @property {object} messages
 * @property {object} err Passed Error
 */
messageSchema.statics.readAllMessagesForPost = function(options, cb) {
  var maxResults = options.maxResults || 50;
  var postId = options.postId;
  var page = options.page;
  // see if message exists, if so pass error
  Message
  .find({ parent: postId })
  .limit(maxResults)
  .skip((page - 1) * maxResults)
  .populate({
    path: 'author',
    select: 'username'
  })
  .exec(function(err, messages){
    if (!err){
      cb(null, messages);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;

