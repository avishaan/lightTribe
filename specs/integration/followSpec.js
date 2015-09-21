var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');

var Promise = require('bluebird');
Promise.promisifyAll(fixture);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var user1 = {
  username: 'user',
  password: 'password',
};
var user2 = {
  username: 'user2',
  password: 'password2',
};

var seedUser = {};
var seedUser2 = {};
var seedImage;

describe("A user", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture
    .deleteDBAsync({})
    .then(function(dbInfo){
      return fixture.seedUserAsync(user1);
    })
    .then(function(user1){
      // save the user1 for later
      seedUser1 = user1;
      return fixture.seedUserAsync(user2);
    })
    .then(function(user2){
      // save the user2 for later
      seedUser2 = user2;
      return fixture.seedImageAsync({});
    })
    .then(function(end){
      done();
    })
    .caught(function(err){
      console.log("Error: ", err);
    });
  });
  it("should be able to add a device to a user", function(done) {
    agent
    .post(URL + '/users/' + seedUser.id + '/devices')
    .set('Content-Type', 'application/json')
    .send({
      access_token: seedUser.token,
      platform: 'ios',
      token: 'a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95'
    })
    .end(function(res){
      var settings = res.body;
      expect(res.status).toEqual(200);
      done();
    });
  });
});
