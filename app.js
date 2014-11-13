'use strict';

var app = require('express')();
var bodyParser = require('body-parser');
var http = require('http');
var parseurl = require('parseurl');
var qs = require('qs');
var swaggerTools = require('swagger-tools');
var swaggerMetadata = swaggerTools.middleware.v2.swaggerMetadata;
var swaggerRouter = swaggerTools.middleware.v2.swaggerRouter;
var swaggerUi = swaggerTools.middleware.v2.swaggerUi;
var swaggerValidator = swaggerTools.middleware.v2.swaggerValidator;
var db = require('./dbs/db');
var config = require('./config.js');
var logger = require('./loggers/logger.js');
var twilio = require('twilio');
var express = require('express');


// Twilio Client information
//var client = new twilio.RestClient(config.twilio.account, config.twilio.auth);
var client = twilio(config.twilio.account, config.twilio.auth);

//Send an SMS text message
//client.sendMessage({
//
//  //to:'+16268889069', // Any number Twilio can deliver to
//  to: '+15136526845',
//  from: '+15102579338', // A number you bought from Twilio and can use for outbound communication
//  body: 'Welcome to Sugar Log' // body of the SMS message
//
//}, function(err, responseData) { //this function is executed when a response is received from Twilio
//
//  if (!err) { // "err" is an error received during the request, if any
//    // "responseData" is a JavaScript object containing data received from Twilio.
//    // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
//    // http://www.twilio.com/docs/api/rest/sending-sms#example-1
//    console.log(responseData.from); // outputs "+14506667788"
//    console.log(responseData.body); // outputs "word to your mother."
//  } else {
//    console.log('There was some sort of error');
//    console.error(err);
//  }
//});
//
//client.sms.messages.list(function(err, data) {
//  if (!err && data && data.length){
//    data.smss.forEach(function(sms) {
//        console.log(sms.To);
//        console.log(sms.Body);
//    });
//  } else {
//    console.error(err);
//  }
//});


// Serve up static front end part of the app
app.use(express.static(__dirname + '/public'));

// swaggerMetadata configuration
var options = {
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var swaggerDoc = require('./api/swagger.json');

// Validate the Swagger document
var result = swaggerTools.specs.v2.validate(swaggerDoc);

// Handle swagger validation errors
if (typeof result !== 'undefined') {
  if (result.errors.length > 0) {
    logger.error('The server could not start due to invalid Swagger document...');
    result.errors.forEach(function (err) {
      logger.error('#/' + err.path.join('/') + ': ' + err.message);
      logger.debug(err);
    });

  }

  if (result.warnings.length > 0) {
    result.warnings.forEach(function (warn) {
      logger.warn('#/' + warn.path.join('/') + ': ' + warn.message);
    });
  }
  if (result.errors.length > 0) {
    process.exit(1);
  }
}

// Wire up the middleware required by Swagger Tools (body-parser and qs)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  if (!req.query) {
    req.query = req.url.indexOf('?') > -1 ? qs.parse(parseurl(req).query, {}) : {};
  }

  return next();
});

// Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
app.use(swaggerMetadata(swaggerDoc));

// Validate Swagger requests
app.use(swaggerValidator());

// Route validated requests to appropriate controller
app.use(swaggerRouter(options));

// Serve the Swagger documents and Swagger UI
app.use(swaggerUi(swaggerDoc));

// Start the server
app.listen(config.expressPort, function () {
  logger.debug('Your server is listening on port %d',config.expressPort);
});
