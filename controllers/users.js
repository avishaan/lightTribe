var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');
var apn = require('apn');

module.exports.unfollowUser = function followUser (req, res, next) {
  var userId = req.swagger.params.body.value.userId;

  // make sure all fields are filled in
  if (!userId) {
    return res.status(500).send({ clientMsg: "Missing parameters" });
  }
  // add the person this user follows to the model
  req.user.unfollow({
    userId: userId
  }, function(err, user){
    if (!err) {
      res.status(200).send({
        _id: user.id
      });
    } else {
      res.status(500).send({
        clientMsg: "Could not stop follow of user"
      });
    }
  });
};

module.exports.followUser = function followUser (req, res, next) {
  var userId = req.swagger.params.body.value.userId;

  // make sure all fields are filled in
  if (!userId) {
    return res.status(500).send({ clientMsg: "Missing parameters" });
  }
  // add the person this user follows to the model
  req.user.follow({
    userId: userId
  }, function(err, user){
    if (!err) {
      res.status(200).send({
        _id: user.id
      });
    } else {
      res.status(500).send({
        clientMsg: "Could not follow user"
      });
    }
  });
};

module.exports.addDevice = function addDevice (req, res, next) {
  var platform = req.swagger.params.body.value.platform;
  var token = req.swagger.params.body.value.token;

  // make sure all fields are filled in
  if (!platform || !token) {
    res.status(500).send({ clientMsg: "Missing parameters" });
  }
  // TODO make sure a hexadecimal string came in
  // call addDevice on user model
  req.user.addDevice({
    platform: platform,
    token: token
  }, function(err, user){
    if (!err) {
      res.status(200).send({
        _id: user.id
      });
    } else {
      res.status(500).send({
        clientMsg: "Could not save device token"
      });
    }
  });

};

module.exports.removeDevice = function removeDevice (req, res, next) {
  var platform = req.swagger.params.body.value.platform;
  var token = req.swagger.params.body.value.token;

  // make sure all fields are filled in
  if (!platform || !token) {
    res.status(500).send({ clientMsg: "Missing parameters" });
  }
  // var apns = require('../notifications/apns.js');
  // apns.feedback.emit('feedback', Date.now(), 'a591bde2720d89d4086beaa843f9b061a18b36b48cd0008a1f347a5ad844be95');
  // TODO make sure a hexadecimal string came in
  // call addDevice on user model
  req.user.removeDevice({
    platform: platform,
    token: token
  }, function(err, user){
    if (!err) {
      res.status(200).send({
        _id: user.id
      });
    } else {
      res.status(500).send({
        clientMsg: "Could not save device token"
      });
    }
  });
};

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
        _id: user.id,
        token: user.token.value
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
      console.log(user);
      res.status(200).send({
        _id: user._id,
        username: user.username,
        interests: user.interests,
        userImage: user.userImage,
        shortDescription: user.profile.shortDescription,
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

// get all the users that passed in user
module.exports.readUserFollows = function (req, res, next) {
  var userId = req.swagger.params.userId.value;

  // check userId passed in
  if (!userId) {
    return res.status(500).send({ clientMsg: "Missing parameters" });
  }

  logger.info('Check who this user follows ' + userId);
  User
  .findOne({ _id: userId })
  .select('-password -token')
  .populate({
    path: 'follows',
    select: '-password -token -devices -auths'
  })
  .lean()
  .exec(function(err, user){
    if (!err && user){
      User
      .populate(user.follows, {path: 'userImage', model:'Image'}, function(err, follows){
        if (!err){
          res.status(200).send(follows);
        } else {
          res.status(500).send({ err: err, clientMsg: "Follows not found" });
        }
      });
    } else {
      res.status(500).send({ err: err, clientMsg: "Follows not found" });
    }
  });
};

module.exports.updateUserSettings = function (req, res, next) {
  var userId = req.swagger.params.userId.value;
  var settings = req.swagger.params.settings.value;
  var options = {};
  options.userImage = settings.userImage || undefined;
  options.interests = settings.interests || undefined;
  options.shortDescription = settings.shortDescription || undefined;

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
