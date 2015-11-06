var logger = require('./../loggers/logger.js');
var async = require('async');
var User = require('./../models/user.js');
var _ = require('underscore');
var Interests = require('./../models/category.js').Interests;

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
      // populate the interests with the full value from the key
      var populatedInterests = populateInterests(user.interests);
      res.status(200).send({
        _id: user._id,
        user: {
          username: user.username,
          userImage: user.userImage,
          lastLogin: (new Date()).toJSON()
        },
        shortDescription: (user.profile && user.profile.shortDescription) ? user.profile.shortDescription : "",
        interests: (populatedInterests.length) ? populatedInterests : user.interests,
      });
    } else {
      res.status(500).send({ err: err, clientMsg: "User not found!" });
    }
  });

  // populate the interests keys into the complete interest object
  var populateInterests = function(interestKeys){
    if (interestKeys && interestKeys.length){
      var interestObject = interestKeys.map(function(key){
        var obj = _.findWhere(Interests, { "key": key });
        return obj;
      });
      // filter out all the undefined
      var cleaned = interestObject.filter(function(n){ return n != undefined; });
      return cleaned;
    } else {
      return [];
    }
  };
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
