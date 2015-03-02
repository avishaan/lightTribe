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

module.exports.profile = function profile (req, res, next) {
  var username = req.swagger.params.username.value;
  logger.info('get user profile');
  User
  .findOne({ 'username': username })
  .select('username id _id profile.reviews profile.points profile.rank email')
  .lean()
  .exec(function(err, user){
    if (!err) {
      res.status(200).send(user);
    } else {
      logger.error(err);
      res.status(500).send(err);
    }
  });
};
