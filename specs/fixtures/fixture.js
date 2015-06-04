var db = require('./../../dbs/db.js');
var User = require('./../../models/user.js');
var Post = require('./../../models/post.js');
var Image = require('./../../models/image.js');
var Comment = require('./../../models/comment.js');
var async = require('async');

// have a consistent user when necessary
var username = 'test';
var password = 'test';
var email = 'test@test.com';

// have a review when necessary
var review = {
  company: 'Company Name',
  description: 'This is a description',
  rating: 1,
  images: ['uhn43civzs6m1c9uurqvr', 'uhn43civzs6m1c9uurqvj', 'uhn43civzs6m1c9uurqvo'],
  datetime: new Date().toJSON(),
  location: '1234.5, 1234.6'
};

module.exports.fbUser = {
  username: 'Susan Amhfgfahddcd Schrockescu',
  password: 'test',
  fb_access_token: 'CAAK07zZBYjUQBAApE8JEVs4B2dyqz7EbqmQTZBD7qu0hpOFUBcx50kR9ZCEm1adRNZCxFyKtDckfNut0niwihpQZBpZCSplGEn6dPb8y6ZCjTI1qDCAwrf2kJRcQsu3JZCedFDZAducfQEt7u7Mvfr7w9lGQ2tchb01RMv8fGV51AIC27fOFTCSYIZCUHR8YFCpw8mXZAQcRoY4MMHt53NvxA68'
};


module.exports.deleteDB = function(cb){
  Post.remove({}, function(err, posts){
    User.remove({}, function(err, user){
      Image.remove({}, function(err, images){
        Comment.remove({}, function(err, comments){
          cb(err, user);
        });
      });
    });
  });
};
module.exports.seedUser = function(options, cb){
  // check if options were passed in
  if (typeof cb === "undefined"){
    // if no options, assume callback was sent in as first param
    cb = options;
    options = null;
  }
  User.create({
    username: username,
    password: password
  }, function(err, user){
    // return the user that was just created
    user = {
      username: username,
      password: password,
      hashedPass : user.password,
      _id: user._id,
      id: user.id,
      token: user.token.value
    };
    cb(err, user);
  });
};
module.exports.seedImage = function(options, cb){
  // check if options were passed in
  if (typeof cb === "undefined"){
    // if no options, assume callback was sent in as first param
    cb = options;
    options = null;
  }
  Image.create({
    // TODO: public id taken from real image, change if you see errors here
    public_id: 'w4isrf95psfjifjpqycm',
    url: 'http://localhost'
  }, function(err, image){
    cb(err, image);
  });
};

// module.exports.seedReview = function(options, cb){
//   var user = options.user;
//   review.submitter = user.id;
//   // first create an image for the review
//   Image.create({
//     public_id: 'uhn43civzs6m1c9uurqvr',
//     url: 'http://localhost'
//   }, function(err, image){
//     review.images = [image._id];
//     Review.create(review, function(err, review){
//       cb(err, review);
//     });
//   });
// };
