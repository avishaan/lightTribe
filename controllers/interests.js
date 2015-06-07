var logger = require('./../loggers/logger.js');
var Interests = require('./../models/interests.js');

module.exports.readAllInterests = function (req, res, next) {
  debugger;
  res.status(200).send(Interests);
};
