var BearerStrategy = require('passport-http-bearer').Strategy;
var User = require('../models/user.js');

module.exports = new BearerStrategy({

},
function(token, done) {
  User.findByToken({
    token: token
  }, function(err, user){
    if (!err){
      return done(null, user);
    } else {
      return done(err);
    }
  });
});
