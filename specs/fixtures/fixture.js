var db = require('./../../dbs/db.js');
var User = require('./../../models/user.js');
var async = require('async');

// have a consistent user when necessary
var username = 'test';
var password = 'test';


module.exports.deleteDB = function(cb){
  User.remove({}, function(err, user){
    cb(err, user);
  });
};
module.exports.seedUser = function(cb){
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
      id: user.id
    };
    cb(err, user);
  });
};
