var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var Image = require('./../models/image.js');
var config = require('../config.js');
var fs = require('fs');

var apn = require('apn');
var service = new apn.Connection({
  pfx: './certs/' + config.cert.filename,
  passphrase: config.cert.passphrase,
  production: config.cert.production
});
service.on('connected', function(openSockets) {
  console.log('Connected to Apple Notification Gateway with sockets:', openSockets);
});
service.on('error', function(error){
  console.log("error: ", error);
});
service.on('timeout', function(){
  console.log('timeout');
});
service.on('socketError', console.log);

// send the notification
var note = new apn.Notification();
note.setAlertText("Test");
note.badge = 1;
service.pushNotification(note, "a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95");



module.exports.mirrorResponse = function mirrorResponse (req, res, next) {
  if (req.header('content-type') == 'application/json') {
    return res.status(500).send({
      clientMsg: "Remove content-type header"
    });
  }
  if (config.env != "prod") {
    req.rawBody = '';
    req.setEncoding('utf8');

    req.on('data', function(chunk) {
      req.rawBody += chunk;
    });
    req.on('end', function() {
      var response = {
        raw: {
          body: req.rawBody,
          headers: req.rawHeaders,
          trailers: req.rawTrailers,
          method: req.method,
          baseURL: req.baseUrl,
          originalURL: req.originalUrl
        },
        parse: {
          body: JSON.parse(req.rawBody),
          url: {
            access_token: req.query.access_token
          }
        }
      };
      return res.status(200).send(response);
    });
  } else {
    return res.status(500).send({
      clientMsg: "Soemthing went wrong, could not mirror"
    });
  }
};
module.exports.apnTestResponse = function apnTestResponse (req, res, next) {
  var imageId = req.swagger.params.imageId.value;
};
