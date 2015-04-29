var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');

module.exports.receiveSMS = function receiveSMS (req, res, next) {
  logger.info('test');
  logger.info('Received Message From: ', req.body.From, ' containing: ', req.body.Body);
  // validate incoming
  var message = new Message({
    from: req.body.From,
    to: req.body.To,
    text: req.body.Body,
    city: req.body.FromCity
  });
  message.respond(function(msg){
    res.send('<Response><Sms>' + msg + '</Sms></Response>');
  });
};

function Message(options) {
  this.from = options.from;
  this.to = options.to;
  this.text = options.text;
  this.type = this.checkType();
  this.response;
}

Object.defineProperties(Message.prototype, {
  "measurement": {
    "get": function() {
      var pattern = /([0-9.]+)/ig;
      var parsed = this.text.match(pattern);
      if (parsed){
        logger.info('Parsing number: ' + parsed);
        return parseFloat(parsed);
      } else {
        return null;
      }
    }
  }
});

Message.prototype.respond = function(cb){
  // response based on the type
  logger.info('respond to query');
  if (this.type === 'register'){
    logger.info('run db register');
    User.register({phone: this.from}, function(err, user){
      logger.info('ran db register');
      if (!err){
        cb('You have registered successfully!');
      } else {
        cb(err.clientMsg);
      }
    });
  } else if (this.type === 'eraseConfirm'){
    logger.info('run db eraseConfirm');
    User.deleteUser({
      phone: this.from
    }, function(err, last){
      logger.info('ran db eraseConfirm');
      if (!err){
        // send the last measurement back to the user
        cb('Your data has been erased permanently.');
      } else {
        cb(err.clientMsg);
      }
    });
  } else if (this.type === 'last'){
    logger.info('run db last');
    User.lastMeasurement({
      phone: this.from
    }, function(err, last){
      logger.info('ran db last');
      if (!err){
        // send the last measurement back to the user
        cb('Your last measurement was: ' + last);
      } else {
        cb(err.clientMsg);
      }
    });
  } else if (this.type === 'measurement'){
    logger.info('run db measurement');
    User.addMeasurement({
      phone: this.from,
      measurement: this.measurement,
      text: this.text
    }, function(err, user){
      logger.info('ran db measurement');
      if (!err){
        // send back message with most recent value added to array
        cb('Received your measurement of: ' + user.measurements.$pop().value);
      } else {
        cb(err.clientMsg);
      }
    });
  } else {
    // any message type where the response didn't need an extra query can just respond here
    cb(this.response);
  }
};

Message.prototype.checkType = function() {
  // return type so we know how to handle the message
  logger.info('Checking message type');
  if (this.isQuestion()) {
    logger.info('Message type is question');
    return 'question';
  } else if (this.isMeasurement()) {
    logger.info('Message type is measurement');
    return 'measurement';
  } else if (this.isErase()){
    logger.info('Message type is erase');
    return 'erase';
  } else if (this.isEraseConfirm()){
    logger.info('Message type is eraseConfirm');
    return 'eraseConfirm';
  } else if (this.isLast()){
    logger.info('Message type is last');
    return 'last';
  } else if (this.isRegister()){
    logger.info('Message type is register');
    return 'register';
  } else {
    this.isFallback();
    return false;
  }
};

Message.prototype.isFallback = function() {
  // do this if there is no match
  this.response = 'Not sure what you are looking for. Type a \'?\' for a list of commands';
};

Message.prototype.isLast = function() {
  // check message type
  var pattern = /(last)/ig;
  if (this.text.match(pattern)) {
    // if so return true
    return true;
  } else {
    return false;
  }
};

Message.prototype.isEraseConfirm = function() {
  // check message type
  var pattern = /(erase all)/ig;
  if (this.text.match(pattern)) {
    // set a message of the user
    this.response = 'Your data has been erased permanently.';
    // if so return true
    return true;
  } else {
    return false;
  }
};

Message.prototype.isErase = function() {
  // check message type
  var pattern = /(erase)(?! all)/ig;
  if (this.text.match(pattern)) {
    // set a message of the user
    this.response = 'Once you erase, the data is gone forever. If you are sure type ERASE ALL';
    // if so return true
    return true;
  } else {
    return false;
  }
};

Message.prototype.isRegister = function() {
  // check message type
  var pattern = /(register)/ig;
  if (this.text.match(pattern)) {
    // set a message of the user
    this.response = "Thanks registering with " + config.appName +
      " By using this app you agree with our legal mumbo jumbo. Start by sending us your glucose level.";
    // if so return true
    return true;
  } else {
    return false;
  }
};

Message.prototype.isMeasurement = function() {
  // check if the message type is measurement
  var pattern = /([0-9.]+)/ig;
  if (this.text.match(pattern)) {
    // set a message of the user
    this.response = "I received your glucose level of "+ this.measurement + ". Nice Work!";
    // if so return true
    return true;
  } else {
    return false;
  }
};

Message.prototype.isQuestion = function() {
  // check if the message type is question
  var pattern = /(\?)+/ig;
  if (this.text.match(pattern)){
    // set a message for the user
    this.response = "I'll help. Just text me your glucose level as a number. Available \
    commands include 'REGISTER' 'ERASE' 'LAST' and '?'";
    // if so return true
    return true;
  } else {
    return false;
  }
};
