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
      User
      .findOne({username: user.username})
      .exec(function(err, user){
        expect(err).toEqual(null);
        expect(user).toBeDefined();
        done();
      });
    });
  });
  // the following test case can be reenabled if you decide to use username/password auth aka basic auth
  //it("should require the user to have a matching password", function(done) {
  //  agent
  //  .get(URL + '/users/' + seedUser.username)
  //  .auth(seedUser.username, 'wrong')
  //  .end(function(res){
  //    expect(res.status).toEqual(500);
  //    done();
  //  });
  //});
  it("should be able to access profile", function(done) {
    agent
    .get(URL + '/users/' + seedUser.username)
    .send({ access_token: seedUser.token })
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body.reviews).toBeDefined();
      expect(res.body.points).toBeDefined();
      expect(res.body.rank).toBeDefined();
      expect(res.body.rank).toEqual('Newbie');
      done();
    });
  });
});
