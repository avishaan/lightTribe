var db = require('./../../dbs/db.js');
var User = require('./../../models/user.js');
var Post = require('./../../models/post.js');
var Image = require('./../../models/image.js');
var Comment = require('./../../models/comment.js');
var Conversation = require('./../../models/conversation.js');
var Report = require('./../../models/report.js');
var Post = require('./../../models/post.js');
var async = require('async');

// have a consistent user when necessary
var username = 'test';
var password = 'test';
var email = 'test@test.com';
var interests = ['yogaBikram', 'yogaVinyasa'];
var userImage = '558d23ce7189b21400bef51b';

// have a review when necessary
var review = {
  company: 'Company Name',
  description: 'This is a description',
  rating: 1,
  images: ['558d23ce7189b21400bef51b', '558d23ce7189b21400bef51b', '558d23ce7189b21400bef51b'],
  datetime: new Date().toJSON(),
  location: '1234.5, 1234.6'
};

var post = {
  id: '1234',
  text: 'This is a post description',
  createDate: Date.now(),
  images: ['558d23ce7189b21400bef51b', '558d23ce7189b21400bef51b', '558d23ce7189b21400bef51b'],
  interests: ['yogaBikram', 'meditationZen'],
  latitude: 37.796096, //San fran, google maps shows lat/lng order
  longitude: -122.418145
};

var comment = {
  text: "Example Comment"
};

module.exports.seeds = {
  post: post,
  comment: comment
};

module.exports.fbUser = {
  username: 'Susan Amhfgfahddcd Schrockescu',
  password: 'test',
  fb_access_token: 'CAAK07zZBYjUQBAApE8JEVs4B2dyqz7EbqmQTZBD7qu0hpOFUBcx50kR9ZCEm1adRNZCxFyKtDckfNut0niwihpQZBpZCSplGEn6dPb8y6ZCjTI1qDCAwrf2kJRcQsu3JZCedFDZAducfQEt7u7Mvfr7w9lGQ2tchb01RMv8fGV51AIC27fOFTCSYIZCUHR8YFCpw8mXZAQcRoY4MMHt53NvxA68'
};


module.exports.deleteDB = function(options, cb){
  // check if options were passed in
  if (typeof cb === "undefined"){
    // if no options, assume callback was sent in as first param
    cb = options;
    options = null;
  }
  Post.remove({}, function(err, posts){
    User.remove({}, function(err, user){
      Image.remove({}, function(err, images){
        Comment.remove({}, function(err, comments){
          Report.remove({}, function(err, reports){
            Conversation.remove({}, function(err, conversations){
              cb(err, user);
            });
          });
        });
      });
    });
  });
};
module.exports.seedUser = function(options, cb){
  // check if options were passed in
  if (typeof cb === "undefined" || !options.hasOwnProperty('username')){
    // NOTE: recently changed this for when an empty object was passed in for the setup to the comments integration route
    if (arguments.length === 1){
      // if 1 arguments assume callback was sent in as first parameter
      cb = options;
      options = {};
    }
    // use username and password from local variable
    options.username = username;
    options.password = password;
    options.interests = interests;
    options.userImage = userImage;
  } else {
    // use passed in options as is
  }
  //console.log(options);
  User.create(options, function(err, user){
    // return the user that was just created
    user = {
      username: user.username,
      password: options.password,
      interests: user.interests,
      hashedPass : user.password,
      _id: user._id,
      id: user.id,
      token: user.token.value,
      model: user // full mongo user model
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
    url: 'https://lh4.googleusercontent.com/-kOsv1Vmk57I/AAAAAAAAAAI/AAAAAAAAAMc/SvhhDYUHktE/s120-c/photo.jpg'
  }, function(err, image){
    cb(err, image);
  });
};

module.exports.seedPost = function(options, cb){
  var text = options.text || post.text;

  Post.createPost({
    text: text,
    createDate: Date.now(),
    author: options.author,
    images: options.images,
    interests: options.interests,
    longitude: options.longitude,
    latitude: options.latitude
  }, function(err, savedPost){
    cb(err, savedPost);
  });
};
module.exports.seedComment = function(options, cb){
  Comment.createComment({
    text: post.text,
    createDate: Date.now(),
    author: options.author,
    parent: options.parent
  }, function(err, savedComment){
    cb(err, savedComment);
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
