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
  author: { type: String, ref: 'User' } // author who created the report
});

// after report is saved, notifiy correct users
 reportSchema.post('save', function(report){
   // find original post
 });
/**
 * Create a specific report
 * @param {object} options The options for the new report
 * @property {date} reportDate date report happened
 * @property {string} author user who created the report
 * @property {string} parentId the parent id for the report
 * @property {string} resource the resource type: post, comment, etc
 * @param {function} cb
 * @property {object} report that was just saved
 * @property {object} err Passed Error
 */
reportSchema.statics.createReport = function(options, cb) {
  // we are redefining the object to make sure other random stuff doesn't come through
  var report = {
    resource: options.resource,
    createDate: Date.now() || options.reportDate,
    author: options.author,
    parentId: options.parentId
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

