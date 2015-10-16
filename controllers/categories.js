var logger = require('./../loggers/logger.js');
var Interests = require('./../models/category.js').Interests;
var EventTypes = require('./../models/category.js').EventTypes;

module.exports.readAllEventTypes = function (req, res, next) {
  res.status(200).send(EventTypes);
};

module.exports.readAllInterestTypes = function (req, res, next) {
  res.status(200).send(Interests);
};

module.exports.readAllInterests = function (req, res, next) {
  res.status(200).send(Interests);
};
