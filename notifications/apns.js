var apn = require('apn');
var config = require('../config.js');
var User = require('../models/user.js');
var logger = require('../loggers/logger.js');

// authentication information, share between connection and feedback
var pfx = './certs/' + config.cert.filename;
var passphrase = config.cert.passphrase;
var production = config.cert.production;

var interval = config.cert.feedbackInterval;

var service = new apn.Connection({
  pfx: pfx,
  passphrase: passphrase,
  production: production
});

var feedback = new apn.Feedback({
  pfx: pfx,
  passphrase: passphrase,
  production: production,
  interval: interval,
  batchFeedback: false
});

feedback.on('error', function(error) {
  console.log("Failed to initialize apns feedback, check certs, error: ", error);
});

feedback.on('feedbackError', function(error) {
  console.log("Feedback error: ", error);
});

feedback.on('feedback', function(time, token) {
  // called once for each feedback event
  // look for user who has a matching token
  // TODO, add unit test for this
  User
  .findOne({ 'devices.token': token })
  .exec(function(err, user){
    if (!err && user){
      // call removeDevice on that user and pass in token, and time
      user.removeDevice({
        platform: 'ios',
        token: token,
        time: time
      }, function(err, user){
        if (err){
          logger.error(err);
        }
      });
    } else {
      logger.error(err);
    }
  });
});

service.on('connected', function(openSockets) {
  console.log('Connected to Apple Notification Gateway with sockets:', openSockets);
});

service.on('error', function(error){
  console.log("Failed to initialize apns network, error: ", error);
});

service.on('timeout', function(){
  console.log('timeout');
});

service.on('socketError', function(){

});

// send the notification
//var note = new apn.Notification();
//note.setAlertText("Test");
//note.badge = 1;
//service.pushNotification(note, "a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95");

// we will use this to generate our notifications
module.exports.service = service;
module.exports.feedback = feedback;
