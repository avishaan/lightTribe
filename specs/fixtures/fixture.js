var db = require('./../../dbs/db.js');
var User = require('./../../models/user.js');
var async = require('async');

// have a consistent user when necessary
var username = 'test';
var password = 'test';

module.exports.fbUser = {
  username: 'Susan Amhfgfahddcd Schrockescu',
  password: 'test',
  fb_access_token: 'CAAK07zZBYjUQBAIR9U8AOgaBrPgyZCZCNZAaw8Fm2lzLx7iBt3T6zKBdjxJzxlQIXLmCu16zlBpoow5fSLZClZByeoyHbcKj1JHFC5jcR2d4IQR5dJcweN8A9TOYPJhMQARSeUv55MAtZCsovLiZCbPzZAs1mfuj1j1c9yZCMNyrZCSUSqCl1ZCTq3kAFlBJ8uygMdAZCxyodNY3b4WAuUiUFDhFG'
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
      id: user.id,
      token: user.token.value
    };
    cb(err, user);
  });
};
