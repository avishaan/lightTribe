var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
var _ = require('underscore');
/*
|-------------------------------------------------------------
| Conversation Schema
|-------------------------------------------------------------
*/

var conversationSchema = new mongoose.Schema({
  createDate: { type: Date, default: Date.now },
  participants: [
    { type: String, ref: 'User' }
  ],
  messages: [
    { type: String, ref: 'Message' }
  ]
});

/**
 * Create a specific conversation
 * @param {object} options The options for the new conversation
 * @property {string} participants of the conversation
 * @property {string} author of the conversation
 * @property {string} text of the conversation
 * @param {function} cb
 * @property {object} conversation 
 * @property {object} err Passed Error
 */
conversationSchema.statics.createConversation = function(options, cb) {
  // make sure the author is inluded in the participants list without being duplicated
  var participants = [].concat(options.author, options.participants);
  participants = _.unique(participants);

  // we are redefining the object to make sure other random stuff doesn't come through
  var convo = {
    text: options.text,
    createDate: Date.now(),
    author: options.author,
    participants: participants
  };
  // conversations that already exist? add this message to existing conversation
  Conversation.findOne({participants: convo.participants})
  // add conversation to the database
  Conversation.create(conversation, function(err, savedConversation){
    if (!err && savedConversation){
      // we created the savedConversation successfully
      cb(null, savedConversation);
    } else {
      logger.error(err);
      cb(err);
    }
  });
};
/**
 * Read a specific conversation
 * @param {object} options The options for the lookup
 * @property {string} conversation id of the conversation
 * @param {function} cb
 * @property {object} conversation 
 * @property {object} err Passed Error
 */
conversationSchema.statics.readConversation = function(options, cb) {
  var id = options.id;
  // see if conversation exists, if so pass error
  Conversation.findOne({_id: id}, function(err, conversation){
    if (!err){
      cb(null, conversation);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

/**
 * Read relevant conversation based on query parameters search
 * @param {object} options The options for the lookup
 * @property {number} options.longitude longitude of the search for conversations in that area using WGS84 guidelines 
 * @property {number} options.latitude latitude of the search for conversations in that area using WGS84 guidelines
 * @property {number} options.radius in units of meters assuming geoJSON guidelines
 * @param {function} cb
 * @property {object} conversations
 * @property {object} err Passed Error
 */
conversationSchema.statics.readConversationsBySearch = function(options, cb) {
  var maxResults = 40; // max results to return
  // see if conversation exists, if so pass error
  var coordinates = [options.longitude, options.latitude];
  var radius = options.radius; // km, sometimes referred to as distance
  var earthRadius = 6371; // km
  var page = options.page || 1;
  Conversation
  .find({})
  .where('loc')
  .near({
    center: coordinates,
    spherical: true,
    maxDistance: radius/earthRadius
  })
  .populate({
    path: 'author',
    select: 'userImage _id username'
  })
  .skip((page - 1) * maxResults)
  .limit(maxResults)
  .exec(function(err, conversations){
    if (!err){
      cb(null, conversations);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};
/**
 * Read all conversations for a user
 * @param {object} options The options for the lookup
 * @property {string} options.userId user id of the user for which you want conversations
 * @param {function} cb
 * @property {object} conversations
 * @property {object} err Passed Error
 */
conversationSchema.statics.readAllConversations = function(options, cb) {
  // see if conversation exists, if so pass error
  Conversation
  .find({submitter: options.userId})
  //.populate('images')
  .exec(function(err, conversations){
    if (!err){
      cb(null, conversations);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

var Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;

