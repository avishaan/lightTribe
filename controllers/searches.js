var logger = require('./../loggers/logger.js');
var config = require('../config.js');
var agent = require('superagent');

module.exports.searchCompany = function searchCompany (req, res, next) {
  var term = req.swagger.params.user.value.term;
  logger.info('search company');
  agent
  .get('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  .field({
    input: 'United Airlines',
    types: 'establishment',
    location: '0,0',
    radius: '20000000',
    key: 'config.google.places.apiKey'
  })
  .end(function(res){
    console.log(res.body);
    res.status(200).send(res.body);
  });
};
