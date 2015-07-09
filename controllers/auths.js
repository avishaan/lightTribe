var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var config = require('../config.js');

module.exports.anonymous = function basic (req, res, next) {
  var user = req.user;
  logger.info('protected route');
  // setup our transform function to only send correct data back to frontend
  function xform (doc, obj, options) {
    return {
      uid: doc.id,
      username: obj.username,
      token: obj.token.value
    };
  }
  res
  .status(200)
  .header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  .send(user.toObject({ transform: xform}));
};
module.exports.basic = function basic (req, res, next) {
  var user = req.user;
  logger.info('protected route');
  // setup our transform function to only send correct data back to frontend
  function xform (doc, obj, options) {
    return {
      uid: doc.id,
      username: obj.username,
      token: obj.token.value
    };
  }
  res
  .status(200)
  .header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  .send(user.toObject({ transform: xform}));
};
module.exports.facebook = function facebook (req, res, next) {
  var user = req.user;
  logger.info('protected route');
  // setup our transform function to only send correct data back to frontend
  function xform (doc, obj, options) {
    return {
      uid: doc.id,
      username: obj.username,
      token: obj.token.value
    };
  }
  res.status(200).send(user.toObject({ transform: xform}));
};
