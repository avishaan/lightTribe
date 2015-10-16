var logger = require('./../loggers/logger.js');
var Interests = require('./../models/interests.js').Interests;

module.exports.readAllInterests = function (req, res, next) {
  res.status(200).send(Interests);
};
