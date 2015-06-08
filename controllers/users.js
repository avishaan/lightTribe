var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');

module.exports.registerUser = function registerUser (req, res, next) {
  var username = req.swagger.params.user.value.username;
  var password = req.swagger.params.user.value.password;
  var interests = req.swagger.params.user.value.interests;
  logger.info('registerUser');
  User.createUser({
    username: username,
    password: password,
    interests: interests

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

module.exports.readUserSettings = function (req, res, next) {
  var userId = req.swagger.params.userId.value;
  logger.info('Reading user settings for user: ' + userId);
  User
  .findOne({ _id: userId })
  .select('-password -token')
  .populate('userImage')
  .lean()
  .exec(function(err, user){
    if (!err && user){
      res.status(200).send({
        _id: user._id,
        username: user.username,
        interests: user.interests,
        thumbnail: user.userImage.url,
        auths: [{
          name: "facebook",
          enabled: true
        }],
        lastLogin: Date.now()
      });
    } else {
      res.status(500).send({ err: err, clientMsg: "User not found!" });
    }
  });
};

module.exports.updateUserSettings = function (req, res, next) {
  var userId = req.swagger.params.userId.value;
  var settings = req.swagger.params.settings.value;
  var options = {};
  options.userImage = settings.userImage || undefined;
  options.interests = settings.interests || undefined;

  logger.info('Updating user settings for user: ' + userId);
  // find the user
  User
  .findOne({ _id: userId })
  .exec(function(err, user){
    if (!err && user){
      user.updateUserSettings(options, function(err, savedUser){
        if (!err){
          res.status(200).send({ _id: savedUser._id.toString() });
        } else {
          res.status(500).send({ err: err, clientMsg: "Could not update user" });
        }
      });
    } else {
      res.status(500).send({ err: err, clientMsg: "Could not update user" });
    }
  });
  // Review
  // .createReviewAsync(review)
  // .then(function(review){
  //   res.status(200).send(review);
  // })
  // .catch(function(err){
  //   res.status(500).send(err);
  // });
};
