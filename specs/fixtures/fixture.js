var db = require('./../../dbs/db.js');
var User = require('./../../models/user.js');
var async = require('async');

// have a consistent user when necessary
var username = 'test';
var password = 'test';

module.exports.fbUser = {
  username: 'Susan Amhfgfahddcd Schrockescu',
  password: 'test',
  access_token: 'CAAK07zZBYjUQBAPN07DMsttKWh8ruCpzktnnNKEOZBtme3gagixRNIrP1TWh1SnjdZB6zbSq3UGm0Ipsb5COfef6FEaD5JribaOch8Dyqf6TZAZAJ6zntV0gnVxe5D4OHDt2VZBpM5kcw8OTTeZClfAQZAGOLGFppYbYNNbX4ZAamUC5RgblZCc9FNX1IsS4CklBQHCsATotrEumcG0bDQ7AyZA'
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
