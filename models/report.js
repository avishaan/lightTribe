var mongoose = require('mongoose');
var logger = require('./../loggers/logger.js');
var utils = require('./../utils/circleToPolygon.js');
var Post = require('./../models/post.js');
var apns = require('./../notifications/apns.js');
var apn = require('apn');
/*
|-------------------------------------------------------------
| Report Schema
|-------------------------------------------------------------
*/

var reportSchema = new mongoose.Schema({
  resource: { type: String },
  reportDate: { type: Date, default: Date.now },
  parentId: { type: String }, // parent id of the resource
});

// after report is saved, notifiy correct users
 reportSchema.post('save', function(report){
   // find original post
 });
/**
 * Create a specific report
 * @param {object} options The options for the new report
 * @property {string} text body of the report
 * @property {date} createDate date report happened
 * @property {string} author user who created the report
 * @property {string} parent the parent post for the report
 * @param {function} cb
 * @property {object} report that was just saved
 * @property {object} err Passed Error
 */
reportSchema.statics.createReport = function(options, cb) {
  // we are redefining the object to make sure other random stuff doesn't come through
  var report = {
    text: options.text,
    createDate: Date.now(),
    author: options.author,
    parent: options.parent
  };
  // add report to the database
  Report.create(report, function(err, savedReport){
    if (!err && savedReport){
      // we created the savedReport successfully
      cb(null, savedReport);
    } else {
      logger.error(err);
      cb(err);
    }
  });
};
var Report = mongoose.model('Report', reportSchema);

module.exports = Report;

