var querystring = require('querystring');
var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');

module.exports.readMeasurements = function readMeasurements (req, res, next) {
  var pid = req.swagger.params.pid.value;
  logger.info('Lookup user ' + pid);
  // make sure to unescape any characters
  pid = querystring.unescape(pid);
  // get the user measurements
  User.getMeasurements({phone: pid}, function(err, measurements){
    if (!err){
      res.status(200).send(measurements);
    } else {
      res.status(500).send(err);
    }
  });
};
