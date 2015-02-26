var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user.js');

module.exports = new LocalStrategy({

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
