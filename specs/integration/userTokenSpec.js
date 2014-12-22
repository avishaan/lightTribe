var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var user = {
  username: 'user',
  password: 'password',
};

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
  it("should be able to register", function(done) {
    agent
    .post(URL + '/users')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      username: user.username,
      password: user.password,
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body._id).toBeDefined();
      done();
    });
  });
  it("should be able to get a valid token via auth", function(done) {
    agent
    .post(URL + '/auths/basic')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .auth(seedUser.username, seedUser.password)
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body.uid).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.token).not.toEqual('placeholder');
      expect(res.body.username).toBeDefined();
      user.token = res.body.token;
      console.log(res.body);
      done();
    });
  });
  it("should be able to access protected data", function(done) {
    agent
    .get(URL + '/users/' + seedUser.username)
    .send({
      access_token: seedUser.token
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      done();
    });
  });
});
