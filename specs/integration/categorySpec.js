var agent = require('superagent');
var config = require("../../config.js");
var Promise = require('bluebird');
var Interests = require("../../models/interests.js").Interests;
var fixture = require('./../fixtures/fixture.js');
//var httpMocks = require('node-mocks-http');
Promise.promisifyAll(fixture);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var seedUser;

describe("Categories", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture
    .deleteDBAsync({})
    .then(function(dbInfo){
      return fixture.seedUserAsync();
    })
    .then(function(user){
      // save the user for later
      seedUser = user;
      done();
    })
    .caught(function(err){
      console.log("Error: ", err);
    });
  });
  it("should return all interests possible in the system", function(done) {
    agent
    .get(URL + '/categories/interests')
    .set('Content-Type', 'application/json')
    .query({ access_token: seedUser.token })
    .end(function(res){
      var interests = res.body;
      expect(res.status).toEqual(200);
      expect(interests.length).toBeDefined();
      expect(interests[0].key).toBeDefined();
      expect(interests[0].title).toBeDefined();
      expect(interests[0].description).toBeDefined();
      expect(interests[0].category).toBeDefined();
      done();
    });
  });
});
describe("Interests", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture
    .deleteDBAsync({})
    .then(function(dbInfo){
      return fixture.seedUserAsync();
    })
    .then(function(user){
      // save the user for later
      seedUser = user;
      done();
    })
    .caught(function(err){
      console.log("Error: ", err);
    });
  });
  it("should return all interests possible in the system", function(done) {
    agent
    .get(URL + '/interests')
    .set('Content-Type', 'application/json')
    .query({ access_token: seedUser.token })
    .end(function(res){
      var interests = res.body;
      expect(res.status).toEqual(200);
      expect(interests.length).toBeDefined();
      expect(interests[0].key).toBeDefined();
      expect(interests[0].title).toBeDefined();
      expect(interests[0].description).toBeDefined();
      expect(interests[0].category).toBeDefined();
      done();
    });
  });
});
