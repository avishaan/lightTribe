var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
var bcrypt = require('bcrypt');
var token = require('rand-token');
/*
|-------------------------------------------------------------
| User Schema
|-------------------------------------------------------------
*/

var userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    reviews: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    rank: { type: String, default: 'Newbie' }
  },
  token: { // auth token data
    value: { type: String, default: 'placeholder' },
    expires: { type: Date, default: Date.now}
  },
  facebook: {
    id: { type: String, required: false, unique: false }
  },
  userImage: { type: String, ref: 'Image' }
});

// if the model itself is new
userSchema.pre('save', function(next) {
  if (this.isNew){
    this.generateToken(function(err){
      return next(err);
    });
  } else {
    return next();
  }
});
// if password is modified, re-hash on save
userSchema.pre('save', function(next) {
  if (this.isModified('password')){
    this.hashPassword(function(err, hash){
      if (err) {
        return next(err);
      } else {
        return next();
      }
    });
  } else {
    return next();
  }
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

  var Promise = require('bluebird');
  // bind to have an object along the chain of promises
  Promise.resolve(User.findOne({username:username}).exec()).bind({})
  .then(function(user){
    this.user = user;
    // call comparePassword with user as the context of this vs global
    return Promise.promisify(user.comparePassword).call(user, password);
  })
  .then(function(match){
    // check password match
    if (match) {
      cb(null, this.user);
    } else {
      throw new Error("invalid username or password");
    }
  })
  .then(undefined, function(err){
    cb(err);
  });
};
/**
 * Hash password
 * @param {function} cb
 * @config {object} err Passed Error
 * @config {boolean} hashed password 
 */
userSchema.methods.hashPassword = function(cb) {
  var user = this;
  var SALT_WORK_FACTOR = 9;
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return cb(err);
    } else {
      // hash the password with our salt
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return cb(err);
        } else {
          // override the password with the hashed version
          user.password = hash;
          return cb(null, hash);
        }
      });
    }
  });
};
/**
 * Static to Check validity of token
 * @param {function} cb
 * @config {object} err Passed Error
 * @config {boolean} new generated token
 */
userSchema.statics.checkToken = function(cb) {
  var value = token.generate('18');
  this.token.value = value;
  cb(null, value);
};
/**
 * Generate new auth token
 * @param {function} cb
 * @config {object} err Passed Error
 * @config {string} new generated token
 */
userSchema.methods.generateToken = function(cb) {
  var value = token.generate('18');
  this.token.value = value;
  cb(null, value);
};
/**
 * Compare two passwords for a match
 * @param {string} password entered 
 * @param {function} cb
 * @config {object} err Passed Error
 * @config {boolean} match Whether or not the password matched
 */
userSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch){
    cb(err, isMatch);
  });
};
/**
 * Find user based on token provided
 * @param {object} details of the user being registered
 * @config {string} token being looked up
 * @param {function} cb
 * @config {object} user instance user doc instance incase you need it
 * @config {object} err Passed Error
 */
userSchema.statics.findByToken = function(options, cb) {
  var token = options.token;
  User
  .findOne({'token.value': token})
  .exec(function(err, user){
    cb(err, user);
  });
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

