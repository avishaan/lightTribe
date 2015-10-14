var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
require('jasmine-expect');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var user = {
  username: 'user',
  password: 'password',
  profile: {
    shortDescription: 'My Desc'
  }
};

var seedUser = {};
var seedImage;

describe("Reading a user profile", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, db){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      // seed a user
      fixture.seedImage(function(err, image){
        expect(err).toEqual(null);
        seedImage = image;
        user.userImage = image._id;
        fixture.seedUser(user, function(err, user){
          expect(err).toEqual(null);
          seedUser = user;
          done();
        });
      });
    });
  });
  it("should require access_token to be filled out", function(done) {
    agent
    .get(URL + '/profiles/' + seedUser.id)
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .end(function(res){
      expect(res.status).toEqual(401);
      done();
    });
  });
  it("should require a valid authentication token to access", function(done) {
    agent
    .get(URL + '/profiles/' + seedUser.id)
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({ access_token: 'wrongtoken' })
    .end(function(res){
      expect(res.status).toEqual(401);
      done();
    });
  });
  it("should return a profile", function(done) {
    agent
    .get(URL + '/profiles/' + seedUser.id)
    .set('Content-Type', 'application/json')
    .query({ access_token: seedUser.token })
    .end(function(res){
      var profile = res.body;
      expect(profile.interests).toBeDefined();
      expect(profile.user).toBeDefined();
      expect(profile.user.username).toBeDefined();
      expect(profile.user.lastLogin).toBeDefined();
      expect(profile.user.lastLogin).toBeIso8601();
      expect(profile.user.userImage).toBeDefined();
      expect(profile.user.userImage.url).toBeDefined();
      expect(res.status).toEqual(200);
      expect(profile.shortDescription).toBeDefined();
      expect(profile.shortDescription).toEqual(user.profile.shortDescription);
      done();
    });
  });
});
