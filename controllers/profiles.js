var logger = require('./../loggers/logger.js');
var async = require('async');
var User = require('./../models/user.js');
var Post = require('./../models/post.js');
var _ = require('underscore');
var Interests = require('./../models/category.js').Interests;

module.exports.readOneProfile = function (req, res, next) {
  var userId = req.swagger.params.userId.value;
  logger.info('Lookup profile for user: ' + userId);
  async.series([
    function(cb) {
    User
    .findOne({ _id: userId })
    .select('-password -token -devices -auths')
    .populate({
      path: 'userImage',
      select: 'url'
    })
    .lean()
    .exec(function(err, user){
      cb(err, user);
    });

  }, function(cb) {
    // get the aggregated list of the users interests
    Post
    .aggregate([
      // Stage 1
    {
      $match: {
        author: userId
      }
    },
    {
      $project: {
        interests: 1
      }
    },
    {
      $unwind: "$interests"
    },
    {
      $group: {
        _id: { key: "$interests" },
        count: { $sum: 1 }

      }
    },
    {
      $project: {
        _id: 0,
        key: "$_id.key",
        count: "$count"
      }
    },
    // put the interests into an array
    {
      $group: {
        _id: null,
        interests: { $push: { key: "$key", count: "$count" } }
      }
    }
    ], function(err, doc){
      if (doc && doc.length){
        var interests = doc[0].interests;
      }
      cb(err, interests);
    });
  }
  ], function(err, results){
    if (!err && results){
      var user = results[0]; // user info in the first results array
      var interests = results[1]; // user post interest cloud results
      // populate the interests with the full value from the key
      var populatedInterests = populateInterests(interests);
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
  var populateInterests = function(interests){
    if (interests && interests.length){
      var interestObject = interests.map(function(interest){
        interest.properties = _.findWhere(Interests, { "key": interest.key });
        return interest;
      });
      // filter out all the undefined
      var cleaned = interestObject.filter(function(n){
        return n.properties != undefined;
      });
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
