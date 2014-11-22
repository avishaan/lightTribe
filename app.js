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
var express = require('express');
var morgan = require('morgan');


// Serve up static front end part of the app
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));

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

// Check if authentication is required
app.use(function(req, res, next){
  debugger;
});

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
