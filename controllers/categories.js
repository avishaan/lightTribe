var logger = require('./../loggers/logger.js');
var Interests = require('./../models/category.js').Interests;

module.exports.readAllEventTypes = function (req, res, next) {
  res.status(200).send(Interests);
};

module.exports.readAllInterestTypes = function (req, res, next) {
  res.status(200).send(Interests);
};

module.exports.readAllInterests = function (req, res, next) {
  res.status(200).send(Interests);
};
