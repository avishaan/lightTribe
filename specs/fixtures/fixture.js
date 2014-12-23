var db = require('./../../dbs/db.js');
var User = require('./../../models/user.js');
var async = require('async');

// have a consistent user when necessary
var username = 'test';
var password = 'test';

module.exports.fbUser = {
  username: 'Susan Amhfgfahddcd Schrockescu',
  password: 'test',
  fb_access_token: 'CAAK07zZBYjUQBAAOkiBVb0lDX1heDgXqitJkVZCleAwu3faNINiGMS9tiselzCPbl5bNfXuQKO0gJV5fi6Of7aLEk7D4hZAXg9GWiAPVALTf7D9jD5XhpfLCAhM1B6vf917immV7YLGFwPCzWxbfAE6IORP2AnxM7wZCXLkSeLA0x4a11IFSvZApp4snKlf43q4uqd3YG2TILLaXAk5Sw'
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
