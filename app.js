'use strict';

var app = require('express')();
var server = require('http').Server(app);
var io = require('./sockets/io.js').init(server);
var bodyParser = require('body-parser');
var multer = require('multer');
var http = require('http');
var parseurl = require('parseurl');
var qs = require('qs');
var swaggerTools = require('swagger-tools');
var db = require('./dbs/db');
var config = require('./config.js');
var logger = require('./loggers/logger.js');
var express = require('express');
var morgan = require('morgan');
var passport = require('passport');
var User = require('./models/user.js');
var Debuggers = require('./controllers/debuggers.js');
var basicAuth = require('./auths/basic.js');
var anonymousAuth = require('./auths/anonymous.js');
var localAuth = require('./auths/local.js');
var facebookAuth = require('./auths/facebook.js');
var tokenAuth = require('./auths/token.js');
var _ = require('underscore');
var prettyjson = require('prettyjson');

var apns = require('./notifications/apns.js');

// Start the server
server.listen(config.expressPort, function () {
  logger.debug('Your server is listening on port %d',config.expressPort);
});

// socket io
// setup socket subscription model
io.on('connection', function(socket){
  logger.info('socket connected');
  // when the client wants to subscribe, they need to send the user information in
  socket.on('subscribe', function(data){
    logger.info('socket wants to subscribe with userId: ' + data.userId);
    // check if we have all the information we need for the event
    if (data.hasOwnProperty('userId')) {
      // allow this client to join the room for the userId
      socket.join(data.userId);
      logger.info('socket joined channel: ' + data.userId );
    }
  });
});


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Expose-Headers", "*");
  res.header('Access-Control-Allow-Methods', '*');
  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

// debugging to send request as response like a mirror
//app.use('/api/dev/mirror', Debuggers.mirrorResponse);

//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
passport.use(basicAuth);
passport.use("anonymous", anonymousAuth);
passport.use(facebookAuth);
passport.use(tokenAuth);
passport.use(localAuth);

app.use(passport.initialize());

// Serve up static front end part of the app
app.use(express.static(__dirname + '/public'));
// morgan after means we don't get the logs for the public routes
app.use(morgan('dev'));

// swaggerMetadata configuration
var options = {
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var swaggerDoc = require('./api/swagger.json');
// based on the config set the swaggerDocs url accordingly
if (config.env !== 'local'){
  swaggerDoc.host = config.apiDomain;
  //swaggerDoc.host = 'localhost:3000';
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

app.use(multer({ dest: './uploads/'}));
// move the files in req.files to req.body due to https://github.com/apigee-127/swagger-tools/issues/60
app.use(function (req, res, next) {
  _.extend(req.body, req.files);
  next();
});
// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator({ validateResponse: config.swagger.validateResponse }));

// Check if authentication is required
app.use(function(req, res, next){
  // check security only on routes that have the security object defined
  // TODO better way for swagger security
  // we are checking req.swagger first because there is something wrong with the way swagger handles files
  if ( req.swagger && req.swagger.operation && req.swagger.operation.security ){
    if (req.swagger.operation.security[0].hasOwnProperty('basicAuth')){
      return passport.authenticate('basic', { session: false })(req, res, next);
    } else if (req.swagger.operation.security[0].hasOwnProperty('facebookAuth')){
      return passport.authenticate('facebook-token', { session: false })(req, res, next);
    } else if (req.swagger.operation.security[0].hasOwnProperty('anonymousAuth')){
      return passport.authenticate('anonymous', { session: false })(req, res, next);
    } else if (req.swagger.operation.security[0].hasOwnProperty('tokenAuth')){
      return passport.authenticate('bearer', { session: false })(req, res, next);
    } else if (req.swagger.operation.security[0].hasOwnProperty('localAuth')){
      return passport.authenticate('local', { session: false })(req, res, next);
    } else {
      // this is if we have security but can't match the paramater
      return next(new Error('could not find auth method'));
    }
  } else {
    return next();
  }
});
  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));
  //make sure if we go to /docs we actually go to swaggerui using our own swaggerjson
  app.use('/docs', function(req, res){
    // if local, just use local version
    if (config.env === 'local'){
      res.redirect('/swaggerui/?url=' + config.apiURI + ':' +config.expressPort + '/api-docs');
    } else {
      // since not local use github page redirect to github page hosting location connected via gh-pages branch
      //res.redirect(config.github.pagesURL +  '/?url=' +  config.github.pagesURL + '/api/swagger.json');
      res.redirect('/swaggerui/?url=' + config.apiURI + '/api-docs');
    }
  });
  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi({
    apiDocs: "/api-docs",
    //http://localhost:3000/docs/?url=http://localhost:3000/api-docs
    swaggerUi: "/swaggerui",
    swaggerUiDir: "./node_modules/swagger-ui/dist/"
  }));
});
// let us know if there are uncaught errors, in any env, later only for dev
// mainly for when swaggerValidate is true since it doesn't tell us the specific error
// the following only runs if there is an error, otherwise it shouldn't run
app.use(function(err, req, res, next){
  console.log(prettyjson.render(err, {}));
  if (err.code == "SCHEMA_VALIDATION_FAILED"){
    // should be swagger validation error, let the FE know.
    res.status(400).send({ error: err });
  } else {
    // we don't know how to handle this, send it along
    next(err);
  }
});
