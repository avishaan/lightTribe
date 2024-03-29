var logger = require('./../loggers/logger.js');
var Comment = require('./../models/comment.js');
var Conversation = require('./../models/conversation.js');
var io = require('./../sockets/io.js');

var Promise = require('bluebird');
// convert built in functions to promises
Promise.promisifyAll(Comment);

module.exports.readAllUserConversations = function (req, res, next) {
  // get the userid from the authenticated user, they are the one that submitted
  var userId = req.user.id;
  // find all conversations where the submitted user is one of the participants
  Conversation
  .readAllUserConversations({
    userId: userId
  }, function(err, conversations){
    if (!err) {
      res.status(200).send(conversations);
    } else {
      res.status(500).send({ err: err });
    }
  });
};

module.exports.createMessageForConversation = function (req, res, next) {
  var sender = req.user.id;
  var recipient = req.swagger.params.conversation.value.recipient;
  var text = req.swagger.params.conversation.value.text;
  Conversation.createConversation({
    author: sender,
    text: text,
    participants: recipient
  }, function(err, conversation) {
    if (!err) {
      res.status(200).send({
        conversationId: conversation._id
      });
    } else {
      res.status(500).send({err: err});
    }
  });
};

module.exports.readOneConversationWithUser = function(req, res, next) {
  var user = req.user;
  var recipientId = req.swagger.params.userId.value;

  Conversation.readOneConversationWithUser({
    recipientId: recipientId,
    userId: user.id
  }, function(err, conversation){
    if (!err && conversation) {
      res.status(200).send(conversation);
    } else if (!err) {
      // we didn't find a conversation, don't error let the front end know
      res.status(200).send({clientMsg: "No conversations with this user exist yet"});
    } else {
      res.status(500).send({err: err});
    }
  });
};

module.exports.readOneConversation = function(req, res, next) {
  var user = req.user.id;
  var conversationId = req.swagger.params.conversationId.value;

  Conversation.readOneConversation({
    conversationId: conversationId
  }, function(err, conversation){
    if (!err) {
      res.status(200).send(conversation);
    } else {
      res.status(500).send({err: err});
    }
  });
};

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
  var maxResults = 40; // max results to return in the route perpage
  var postId = req.swagger.params.postId.value;
  var page = req.swagger.params.page.value;
  logger.info('Read all comments for post:' + postId);
  Comment
  .readAllCommentsForPostAsync({
    postId: postId,
    maxResults: maxResults,
    page: page
  })
  .then(function(comments){
    res.status(200).send(comments);
  })
  .caught(function(err){
    res.status(500).send(err);
  });
};
