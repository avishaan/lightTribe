var db = require('./../../dbs/db.js');
var User = require('./../../models/user.js');
var async = require('async');

// have a consistent user when necessary
var username = 'test';
var password = 'test';

module.exports.fbUser = {
  username: 'Susan Amhfgfahddcd Schrockescu',
  password: 'test',
  access_token: 'CAAK07zZBYjUQBAIXsISPvJlsLIbiduRO66hUskTvNrFCEag3fkSc8uu5et6aIrZCGAHNMMm9ZC6f4mFe7C4X1AaeGIJKCAjP82T1YNeW9G9RQ7cRXuDOIc5IVQWnCweS62pSumyHko0ISeK0LB67YaKQBDLDPg1TFOyJvpD84O3Uf3M3J3OUpOqA7iUwLMBSoO6IQ4ZCMU83MA89qRnR'
};


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
