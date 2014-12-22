var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user.js');

module.exports = new BasicStrategy({

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
