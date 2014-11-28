var querystring = require('querystring');
var logger = require('./../loggers/logger.js');
var config = require('../config.js');

module.exports.createReview = function createReview (req, res, next) {
  logger.info('create review route');
  res.status(200).send('ok');
};

module.exports.readReview = function readReview (req, res, next) {
  var rid = req.swagger.params.rid.value;
  logger.info('Lookup user ' + rid);
  // make sure to unescape any characters
  rid = querystring.unescape(rid);
  // get the user measurements
  User.getMeasurements({phone: rid}, function(err, measurements){
    if (!err){
      res.status(200).send(measurements);
    } else {
      res.status(500).send(err);
    }
  });
};
