var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');

module.exports.registerUser = function registerUser (req, res, next) {
  var username = req.swagger.params.user.value.username;
  var password = req.swagger.params.user.value.password;
  logger.info('registerUser');
  User.createUser({
    username: username,
    password: password
  }, function(err, user){
    if (!err && user){
      res.status(200).send({
        _id: user.id
      });
    } else {
      res.status(500).send(err);
    }
  });
};

module.exports.facebook = function facebook (req, res, next) {
  logger.info('protected route');
  debugger;
  res.status(200).send({
    reviews: 0,
    points: 100000,
    rank: 'newbie'
  });
};
module.exports.profile = function profile (req, res, next) {
  logger.info('protected route');
  res.status(200).send({
    reviews: 0,
    points: 100000,
    rank: 'newbie'
  });
};
