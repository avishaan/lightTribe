var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var chance = new require('chance').Chance();
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var anonUser = {
  username: "Anon",
  GUID: chance.guid()
};

var seedUser = {};

describe("An anonymous user", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, user){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      // seed a user
      fixture.seedUser(function(err, user){
        expect(err).toEqual(null);
        seedUser = user;
        done();
      });
    });
  });
  it("should be able to authenticate with only a GUID", function(done) {
    agent
    .post(URL + '/auths/anonymous')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      username: anonUser.username,
      GUID: anonUser.GUID
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body.uid).toBeDefined();
      expect(res.body.password).not.toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.token).not.toEqual('placeholder');
      expect(res.body.username).toBeDefined();
      done();
    });
  });
  it("should always have the same internal id", function(done) {
    agent
    .post(URL + '/auths/anonymous')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      username: anonUser.username,
      GUID: anonUser.GUID
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      anonUser.id = res.body.uid;

      // have the same user access the route again
      agent
      .post(URL + '/auths/anonymous')
      .set('Content-Type', 'application/json')
      .send({
        username: anonUser.username,
        GUID: anonUser.GUID
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        // make sure it returns the same uid as it did the first time
        expect(anonUser.id).toEqual(res.body.uid);
        done();
      });
    });
  });
  it("should be able to assign a default interest when none is passed in", function(done) {
    agent
    .post(URL + '/auths/anonymous')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      username: anonUser.username,
      GUID: anonUser.GUID
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      User
      .findOne({username: anonUser.username})
      .exec(function(err, savedUser){
        expect(err).toEqual(null);
        expect(savedUser).toBeDefined();
        expect(savedUser.interests.length).toEqual(1);
        expect(savedUser.interests[0]).toEqual('yogaBikram');
        done();
      });
    });
  });
});
