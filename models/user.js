var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
/*
|-------------------------------------------------------------
| User Schema
|-------------------------------------------------------------
*/

var userSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
});
/**
 * Register a new user
 * @param {object} details of the user being registered
 * @config {string} username of the user
 * @config {string} password of the user
 * @param {function} cb
 * @config {object} user instance user doc instance incase you need it
 * @config {object} err Passed Error
 */
userSchema.statics.registerUser = function(options, cb) {
  var username = options.username;
  var password = options.password;
  // make sure existing username doesn't exist
  // make sure existing email doesn't exist
  // register user
  User.create({
    username: username,
    password: password
  }, function(err, user){
    if (!err && user){
      cb(null, user);
    } else {
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

var User = mongoose.model('User', userSchema);

module.exports = User;

