var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user.js');

module.exports = new LocalStrategy({
  passReqToCallback: true,
  // NOTE: we are setting the following two fields otherwise we get http error 400
  usernameField: 'GUID',
  passwordField: 'GUID'
}, function(req, username, password, done) {
  // these will be the actual fields we are interested in
  var username = req.swagger.params.body.value.username;
  var id = req.swagger.params.body.value.GUID;
  var interests = req.swagger.params.body.value.interests;

  User.checkAnonAuth({
    username: username,
    id: id,
    interests: interests
  }, function(err, user){
    if (!err){
      return done(null, user);
    } else {
      return done(err);
    }
  });
});
