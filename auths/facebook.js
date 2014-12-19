var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user.js');
var config = require('../config.js');
debugger;
module.exports = new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  callbackURL: config.apiURI + ':' + config.expressPort + '/auth/facebook/callback'
},
function(username, password, done) {
  User.checkAuthentication({
    username: username,
    password: password
  }, function(err, user){
    if (!err){
      return done(null, user);
    } else {
      return done(err);
    }
  });
});
