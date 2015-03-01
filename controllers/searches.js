var logger = require('./../loggers/logger.js');
var config = require('../config.js');
var agent = require('superagent');

module.exports.searchCompany = function searchCompany (req, res, next) {
  var term = req.swagger.params.term.value;
  logger.info('search company');
  agent
  .get('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  .query({
    input: 'United Airlines',
    types: 'establishment',
    location: '0,0',
    radius: '20000000',
    key: config.google.places.apiKey
  })
  .end(function(result){
    // no var declaration in if statement
    if (result.body.status === ('OK' || 'ZERO_RESULTS' )) {
      var places = result.body.predictions
      .map(function(result){
        return {
          name: result.description,
          _id: result.place_id
        };
      });
      res.status(200).send(places);
    } else {
      res.status(500).send(result.body);
    }
  });
};
