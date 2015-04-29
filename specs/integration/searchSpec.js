var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');
var cloudinary = require('cloudinary');

// config cloudinary
cloudinary.config(config.cloudinary);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var seedUser;

describe("A search", function() {
  jasmine.getEnv().defaultTimeoutInterval = 20000;
  beforeEach(function(done){
    fixture.deleteDB(function(err){
      fixture.seedUser(function(err, user){
        seedUser = user;
        done();
      });
    });
  });
  it("requires a term to search", function(done) {
    agent
    .get(URL + '/search/')
    .query({access_token: seedUser.token})
    .end(function(res){
      expect(res.status).not.toEqual(200);
      done();
    });
  });
  it("can return results when only given a search term", function(done) {
    agent
    .get(URL + '/search/Star')
    .query({access_token: seedUser.token})
    .end(function(res){
      var places = res.body;
      expect(res.status).toEqual(200);
      expect(places).toBeDefined();
      expect(places.length).toBeDefined();
      done();
    });
  });
  it("can return results with a lat/long", function(done) {
    agent
    .get(URL + '/search/Star')
    .query({access_token: seedUser.token})
    .query({loc: '37.76999,-122.44696'})
    .end(function(res){
      var places = res.body;
      expect(res.status).toEqual(200);
      expect(places).toBeDefined();
      expect(places.length).toBeDefined();
      done();
    });
  });
});
