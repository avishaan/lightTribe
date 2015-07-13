var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var Report = require('./../models/report.js');
var config = require('../config.js');

module.exports.createReport = function createReport (req, res, next) {
  logger.info('report created');
  var _id = req.swagger.params.body.value._id;
  var resource = req.swagger.params.body.value.resource;
  var author = req.user.id;
  Report.createReport({
    reportDate: Date.now(),
    author: author,
    parentId: _id,
    resource: resource
  }, function(err, report){
    if (!err && report){
      res.status(200).send(report);
    } else {
      res.status(500).send({clientMsg: "Could not create report", err: err});
    }
  });
};
