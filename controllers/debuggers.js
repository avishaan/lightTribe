var logger = require('./../loggers/logger.js');
var User = require('./../models/user.js');
var Image = require('./../models/image.js');
var config = require('../config.js');
var fs = require('fs');


module.exports.mirrorResponse = function mirrorResponse (req, res, next) {
  if (req.header('content-type') == 'application/json') {
    return res.status(500).send({
      clientMsg: "Remove content-type header"
    });
  }
  if (config.env != "prod") {
    req.rawBody = '';
    req.setEncoding('utf8');

    req.on('data', function(chunk) {
      req.rawBody += chunk;
    });
    req.on('end', function() {
      var response = {
        raw: {
          body: req.rawBody,
          headers: req.rawHeaders,
          trailers: req.rawTrailers,
          method: req.method,
          baseURL: req.baseUrl,
          originalURL: req.originalUrl
        },
        parse: {
          body: JSON.parse(req.rawBody),
          url: {
            access_token: req.query.access_token
          }
        }
      };
      return res.status(200).send(response);
    });
  } else {
    return res.status(500).send({
      clientMsg: "Soemthing went wrong, could not mirror"
    });
  }
};
module.exports.apnTestResponse = function apnTestResponse (req, res, next) {
  var imageId = req.swagger.params.imageId.value;
  logger.info('return url');
  // find image id
  Image
  .findOne({_id: imageId })
  .select ('_id url')
  .lean()
  .exec(function(err, image){
    if (!err && image){
      res.status(200).send(image);
    } else if (!err && !image) {
      res.status(404).send({});
    } else {
      res.status(500).send({ error: err });
    }
  });
};
