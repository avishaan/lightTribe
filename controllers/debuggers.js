var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var Image = require('./../models/image.js');
var config = require('../config.js');
var fs = require('fs');
var apn = require('apn');
var apns = require('../notifications/apns.js');

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
      clientMsg: "Route not available in Production"
    });
  }
};

module.exports.apnTestResponse = function apnTestResponse (req, res, next) {
  var token = req.swagger.params.body.value.token;
  var note = new apn.Notification();
  var message =  "Test Notification sent at: " + new Date() + " to token: " + token;
  note.setAlertText(message);
  note.badge = 1;

  apns.service.pushNotification(note, token);
  res.status(200).send({
    clientMsg: message
  });

};
