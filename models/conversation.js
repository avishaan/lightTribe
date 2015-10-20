var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
var _ = require('underscore');
var Message = require('./../models/message.js');
var User = require('./../models/user.js');
// get the io instance from the main app.js file so we can share with multiple files
var io = require('./../app.js').io;
var async = require('async');
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
    //{ type: String, ref: 'Message' }
    Message.schema
  ]
});

// after conversation is saved, let everyone know there is an update to the conversation
conversationSchema.post('save', function(doc){
  logger.info('finished save, trigger an event on the socket');
  doc.participants.forEach(function(participant){
    // emit an event to each participants 'room'
    io.to(participant).emit('conversation:update');
  });
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
  // create the message that we will insert 
  var message = new Message({
    text: convo.text,
    createDate: convo.createDate,
    author: convo.author
  });
  // conversations that already exist? add this message to existing conversation
  Conversation
  .findOne({participants: { $all: convo.participants }})
  .exec(function(err, foundConvo){
    // check whether we need to create a new convo or save the message to an existing convo
    if (!err && foundConvo){
      // there is already a convo with these participants, add this message to existing convo
      foundConvo.messages.push(message);
      foundConvo.save(function(err, savedConvo){
        cb(err, savedConvo);
      });
    } else if (!err && !foundConvo) {
      // create a new convo that includes this message
      Conversation
      .create({
        participants: convo.participants,
        messages: [message.toJSON()]
      }, function(err, savedConvo){
        cb(err, savedConvo);
      });
    } else { // had a problem
      cb(err, null);
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
 * Read one conversation with a user based on recipient id
 * @param {object} options The options for the lookup
 * @property {string} options.recipientId user id of the user for which you want conversation
 * @property {string} options.userId user id of the user who is performing the lookup
 * @param {function} cb
 * @property {object} conversation
 * @property {object} err Passed Error
 */
conversationSchema.statics.readOneConversationWithUser = function(options, cb) {
  // find all conversations where the user is a participant in the conversation
  Conversation
  .findOne({ participants: { "$size": 2, "$all": [options.recipientId, options.userId] }})
  .populate('messages.author')
  .exec(function(err, conversation){
    if (!err && conversation && conversation.messages){
      User
      .populate(conversation.messages, {
        path: 'author.userImage',
        model: 'Image'
      }, function(err, doc){
        cb(err, conversation);
      });
    } else if (!err){
      // didn't find a conversation but didn't error, nothing to pass back
      cb(null, null);
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};
/**
 * Read one conversation for a user
 * @param {object} options The options for the lookup
 * @property {string} options.conversationId user id of the user for which you want conversations
 * @param {function} cb
 * @property {object} conversation
 * @property {object} err Passed Error
 */
conversationSchema.statics.readOneConversation = function(options, cb) {
  // find all conversations where the user is a participant in the conversation
  Conversation
  .findOne({ _id: options.conversationId})
  .populate('messages.author')
  .exec(function(err, conversation){
    if (!err){
      User
      .populate(conversation.messages, {
        path: 'author.userImage',
        model: 'Image'
      }, function(err, doc){
        cb(err, conversation);
      });
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
conversationSchema.statics.readAllUserConversations = function(options, cb) {
  // find all conversations where the user is a participant in the conversation
  Conversation
  .find({ participants: { $in: [options.userId ]}})
  .populate('participants')
  .select('-messages')
  .lean()
  .exec(function(err, conversations){
    if (!err){
      async.map(conversations, function(conversation, callback){
        // populate the userImage for each participant in this convo
        Conversation
        .populate(conversation.participants, { path: 'userImage', model: 'Image' },
        function(err, participants){
          callback(err, conversations);
        });
      }, function(err){
        cb(err, conversations);
      });
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

var Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;

