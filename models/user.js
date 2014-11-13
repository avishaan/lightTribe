var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
/*
|-------------------------------------------------------------
| User Schema
|-------------------------------------------------------------
*/

var userSchema = new mongoose.Schema({
  phone: { type: String },
  messages: [{ //this is every single message, reading or interaction with the service
    time: { type: Date },
    body: { type: String }
  }],
  measurements: [{ // all the messages for successful readings are kept here
    time: { type: Date },
    text: { type: String }, // raw text message body
    value: { type: Number } // parsed glucose value
  }]
});

/**
/**
 * Delete user and all their data
 * @param {object} options The options for the user being deleted
 * @config {string} phone number of the user
 * @param {function} cb
 * @config {object} user doc instance, otherwise null if not exists
 * @config {object} err Passed Error
 */
userSchema.statics.deleteUser = function(options, cb) {
  var phone = options.phone;
  // see if user exists, if so pass error
  User
  .findOneAndRemove({phone: phone})
  .exec(function(err, user) {
    if (!err && user){
      // user exists, no error
      logger.info('removed user');
      cb(null, user);
    } else if (!err && !user) {
      // user doesn't exist, let FE know
      logger.debug("user did not exist to delete");
      cb(null, null);
    } else {
      // we had a database user, set client message accordingly
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};
/**
/**
 * Check of user exists. If the user doesn't exist return a message
 * @param {object} options The options for the notifications
 * @config {string} phone number of the user
 * @param {function} cb
 * @config {object} user doc instance, otherwise null if not exists
 * @config {object} err Passed Error
 */
userSchema.statics.lookup = function(options, cb) {
  var phone = options.phone;
  // see if user exists, if so pass error
  User
  .findOne({phone: phone})
  .exec(function(err, user) {
    if (!err && user){
      // user exists, no error
      cb(null, user);
    } else if (!err && !user) {
      // user doesn't exist, let FE know
      logger.debug("user doesn't exist");
      cb(null, null);
    } else {
      // we had a database user, set client message accordingly
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

/**
 * Get all the measurements for the user along with the time
 * @param {object} options The options for the lookup
 * @config {string} phone number of the user
 * @param {function} cb
 * @config {array} measurements
 * @config {object} err Passed Error
 */
userSchema.statics.getMeasurements = function(options, cb) {
  var phone = options.phone;
  // see if user exists, if so pass error
  User.lookup({phone: phone}, function(err, user){
    if (!err && user){
      var measurements = user.measurements;
      cb(null, measurements);
    } else if (!err && !user){
      // need to register before using the app
      logger.error('user is not registerd');
      cb({err: 'user does not exist', clientMsg: 'Please REGISTER first'});
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

/**
 * Check last measurement for the user
 * @param {object} options The options for the notifications
 * @config {string} phone number of the user
 * @param {function} cb
 * @config {integer} last measurement received
 * @config {object} err Passed Error
 */
userSchema.statics.lastMeasurement = function(options, cb) {
  var phone = options.phone;
  // see if user exists, if so pass error
  User.lookup({phone: phone}, function(err, user){
    debugger;
    if (!err && user){
      var last = user.measurements.$pop().value;
      cb(null, last);
    } else if (!err && !user){
      // need to register before using the app
      logger.error('user is not registerd');
      cb({err: 'user does not exist', clientMsg: 'Please REGISTER first'});
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

/**
 * Add measurement for user. If the user doesn't exist return error
 * @param {object} options The options for the notifications
 * @config {string} phone number of the user
 * @config {string} measurement amount
 * @config {string} raw text body for future use and reanalysis
 * @param {function} cb
 * @config {object} user instance user doc instance incase you need it
 * @config {object} err Passed Error
 */
userSchema.statics.addMeasurement = function(options, cb) {
  var measurement = options.measurement;
  var phone = options.phone;
  var text = options.text; // original text message for saving to db
  // see if user exists, if so pass error
  User.lookup({phone: phone}, function(err, user){
    if (!err && user){
      // found user, add measurement
      user.measurements.push({
        time: Date.now(),
        text: text,
        value: measurement
      });
      // save changes
      user.save(function(err, user){
        if (!err){
          cb(null, user);
        } else {
          // we had some sort of database error
          logger.error(err);
          cb({err: err, clientMsg: 'Something broke, try again'}, null);
        }
      });
    } else if (!err && !user){
      // need to register before using the app
      logger.error('user is not registerd');
      cb({err: 'user does not exist', clientMsg: 'Please REGISTER first'});
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

/**
 * Register a new user
 * @param {object} options The options for the notifications
 * @config {string} phone number of the user
 * @param {function} cb
 * @config {object} user instance user doc instance incase you need it
 * @config {object} err Passed Error
 */
userSchema.statics.register = function(options, cb) {
  var phone = options.phone;
  // see if user exists, if so pass error
  User.lookup({phone: phone}, function(err, user){
    if (!err && !user){
      // create and register the user
      User
      .create({
        phone: phone
      }, function(err, user){
        if (!err && user){
          // we created the user successfully
          logger.info('User created successfully');
          cb(null, user);
        } else {
          logger.error(err);
          cb({err: err, clientMsg: 'Something broke, try again'}, null);
        }
      });
    } else if (!err && user) {
      // user already exists, let the front know
      logger.error('user exists');
      cb({err: 'user exists', clientMsg: 'You have already registered, no need to register again'}, null);
    } else {
      // we had a database user, set client message accordingly
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

var User = mongoose.model('User', userSchema);

module.exports = User;

