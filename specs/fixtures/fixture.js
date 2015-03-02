var db = require('./../../dbs/db.js');
var User = require('./../../models/user.js');
var Review = require('./../../models/review.js');
var async = require('async');

// have a consistent user when necessary
var username = 'test';
var password = 'test';
var password = 'test@test.com';

module.exports.fbUser = {
  username: 'Susan Amhfgfahddcd Schrockescu',
  password: 'test',
  fb_access_token: 'CAAK07zZBYjUQBAApE8JEVs4B2dyqz7EbqmQTZBD7qu0hpOFUBcx50kR9ZCEm1adRNZCxFyKtDckfNut0niwihpQZBpZCSplGEn6dPb8y6ZCjTI1qDCAwrf2kJRcQsu3JZCedFDZAducfQEt7u7Mvfr7w9lGQ2tchb01RMv8fGV51AIC27fOFTCSYIZCUHR8YFCpw8mXZAQcRoY4MMHt53NvxA68'
};


module.exports.deleteDB = function(cb){
  Review.remove({}, function(err, reviews){
    User.remove({}, function(err, user){
      cb(err, user);
    });
  });
};
module.exports.seedUser = function(cb){
  User.create({
    username: username,
    password: password,
    email: email
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
