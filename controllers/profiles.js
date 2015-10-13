var logger = require('./../loggers/logger.js');
var async = require('async');
var User = require('./../models/user.js');

var Promise = require('bluebird');

module.exports.readOneProfile = function (req, res, next) {
  var userId = req.swagger.params.userId.value;
  logger.info('Lookup profile for user: ' + userId);
  User
  .findOne({ _id: userId })
  .select('-password -token -devices -auths')
  .populate({
    path: 'userImage',
    select: 'url'
  })
  .lean()
  .exec(function(err, user){
    if (!err && user){
      res.status(200).send({
        _id: user._id,
        user: {
          username: user.username,
          userImage: user.userImage,
          lastLogin: Date.now()
        },
        shortDescription: user.profile ? user.profile.shortDescription : "",
        interests: user.interests,
      });
    } else {
      res.status(500).send({ err: err, clientMsg: "User not found!" });
    }
  });
  //res.status(200).send({
  //  _id: "123",
  //  categories: {
  //    yoga: 10,
  //    meditation: 50,
  //    dancing: 11,
  //    healing: 70
  //  },
  //  user: {
  //    username: "codeHatcher",
  //    thumbnail: "https://www.google.com/images/srpr/logo11w.png",
  //    lastLogin: Date.now()
  //  }
  //});
  // Review
  // .createReviewAsync(review)
  // .then(function(review){
  //   res.status(200).send(review);
  // })
  // .catch(function(err){
  //   res.status(500).send(err);
  // });
};
