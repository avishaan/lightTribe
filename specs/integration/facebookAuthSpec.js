var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var user = fixture.fbUser;

var seedUser = {};

describe("A user", function() {
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
  it("should be able to authenticate with facebook", function(done) {
    agent
    .post(URL + '/auths/facebook')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      access_token: user.fb_access_token
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body.uid).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.token).not.toEqual('placeholder');
      expect(res.body.username).toBeDefined();
      done();
    });
  });
  it("should be able to change username after authenticating with facebook", function(done) {
    var fbUser;
    agent
    .post(URL + '/auths/facebook')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      access_token: user.fb_access_token
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      var user = res.body;
      fbUser = user;
      // console.log(fbUser);

      var newUsername = "changedUsername";

      agent
      .post(URL + '/users/' + fbUser.uid)
      .set('Content-Type', 'application/json')
      .send({
        access_token: fbUser.token,
        username: newUsername
      })
      .end(function(res){
        var settings = res.body;
        expect(res.status).toEqual(200);
        // find that user and check the values now
        User
        .findOne({ _id: fbUser.uid })
        .lean()
        .exec(function(err, user){
          expect(user.username).toEqual(newUsername);
          // fbUser.username = user.username;
          done();
        });
      });
    });
  });
});
