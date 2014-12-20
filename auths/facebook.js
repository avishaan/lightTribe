var FacebookStrategy = require('passport-facebook-token').Strategy;
var User = require('../models/user.js');
var config = require('../config.js');
var randomString = require('random-string');

module.exports = new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret
},
function(token, refreshToken, profile, done) {
  User.findOne({
    'facebook.id': profile.id
  }, function(err, user){
    if (!err){
      if (user) {
        return done(null, user);
      } else {
        // no error but no user, go ahead and add and return that user
        User.create({
          password: randomString(),
          username: profile.username || 'fb' + profile.id,
          facebook: {
            id: profile.id
          }
        }, function(err, newUser){
          if (!err){
            return done(null, newUser);
          } else {
            return done(err);
          }
        });
      }
    } else {
      return done(err);
    }
  });
});
