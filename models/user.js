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
 * Create a new user
 * @param {object} details of the user being created
 * @config {string} username of the user
 * @config {string} password of the user
 * @param {function} cb
 * @config {object} user instance user doc instance incase you need it
 * @config {object} err Passed Error
 */
userSchema.statics.createUser = function(options, cb) {
  var username = options.username;
  var password = options.password;

  // check the user exists
  User
  .create({
    username: username,
    password: password
  }, function(err, user){
    if (!err && user){
      cb(null, user);
    } else {
      err.clientMsg = 'could not register user';
      cb(err);
    }
  });
};

/**
 * Check authentication for a user
 * @param {object} details of the user whose password is being checked
 * @config {string} username of the user
 * @config {string} password of the user
 * @param {function} cb
 * @config {object} user instance user doc instance incase you need it
 * @config {object} err Passed Error
 */
userSchema.statics.checkAuthentication = function(options, cb) {
  var username = options.username;
  var password = options.password;

  // check the user exists
  User
  .findOne({username: username})
  .select('username password')
  .exec(function(err, user){
    if (!err && user){
      user.comparePassword(password, function(err, match){
        if (match) {
          cb(null, user);
        } else {
          err = {clientMsg: 'invalid password'};
          cb(err);
        }
      });
    } else {
      err = {clientMsg: 'invalid username or password'};
      cb(err);
    }
  });
  // if user exists check the password
};
/**
 * Compare two passwords for a match
 * @param {string} password entered 
 * @param {function} cb
 * @config {object} err Passed Error
 * @config {boolean} match Whether or not the password matched
 */
userSchema.methods.comparePassword = function(password, cb) {
  if (this.password === password){
    cb(null, true);
  } else {
    cb({clientMsg: 'password does not match'}, false);
  }
};
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

