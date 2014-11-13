var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
/*
|-------------------------------------------------------------
| Review Schema
|-------------------------------------------------------------
*/

var reviewSchema = new mongoose.Schema({
  company: { type: String },
  description: { type: String },
  rating: { type: Number },
  datetime: { type: Date },
  location: { type: String },
  images: [{
    url: { type: String }
  }]
});

/**
 * Create a specific review
 * @param {object} options The options for the new review
 * @config {string} company of the review
 * @param {function} cb
 * @config {object} review 
 * @config {object} err Passed Error
 */
reviewSchema.statics.createReview = function(options, cb) {
  var company = options.company;
  // add review to the database
  Review.create({
    company: company
  }, function(err, review){
    if (!err && review){
      // we created the review successfully
      cb(null, review);
    } else {
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};
/**
 * Read a specific review
 * @param {object} options The options for the lookup
 * @config {string} review id of the review
 * @param {function} cb
 * @config {object} review 
 * @config {object} err Passed Error
 */
reviewSchema.statics.readReview = function(options, cb) {
  var id = options.id;
  // see if review exists, if so pass error
  Review.find({id: id}, function(err, review){
    if (!err && review){
      cb(null, review);
    } else if (!err && !review){
      // need to register before using the app
      logger.error('review doesn not exist');
      cb({err: 'review does not exist', clientMsg: 'Review no longer exists'});
    } else {
      // we had some sort of database error
      logger.error(err);
      cb({err: err, clientMsg: 'Something broke, try again'}, null);
    }
  });
};

var Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

