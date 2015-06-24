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
var seedImage;

describe("A user", function() {
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
  it("should be able to register", function(done) {
    var user = {
      username: 'user2',
      password: 'stillpassword',
      interests: ['yogaVinyasa']
    };
    agent
    .post(URL + '/users')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      username: user.username,
      password: user.password,
      interests: user.interests
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body._id).toBeDefined();
      User
      .findOne({username: user.username})
      .exec(function(err, savedUser){
        expect(err).toEqual(null);
        expect(savedUser).toBeDefined();
        expect(savedUser.interests[0]).toEqual(user.interests[0]);
        done();
      });
    });
  });
  it("should be able to forget to add an interest", function(done) {
    // if the user forgets to add an interest, have the backend add a default
    var user = {
      username: 'user2',
      password: 'stillpassword'
    };
    agent
    .post(URL + '/users')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      username: user.username,
      password: user.password
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body._id).toBeDefined();
      User
      .findOne({username: user.username})
      .exec(function(err, savedUser){
        expect(err).toEqual(null);
        expect(savedUser).toBeDefined();
        expect(savedUser.interests[0]).toEqual('yogaBikram');
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
  it("should be able to access user settings", function(done) {
    agent
    .get(URL + '/users/' + seedUser.id)
    .send({ access_token: seedUser.token })
    .end(function(res){
      var settings = res.body;
      expect(res.status).toEqual(200);
      expect(settings.password).not.toBeDefined();
      expect(settings.lastLogin).toBeDefined();
      expect(settings.thumbnail).toBeDefined();
      expect(settings.auths).toBeDefined();
      expect(settings.lastLogin).toBeDefined();
      expect(settings.auths[0].name).toBeDefined();
      expect(settings.interests).toBeDefined();
      //expect(settings.username).toEqual(seedUser.username);
      done();
    });
  });
  it("should be able to change their interests", function(done) {
    agent
    .post(URL + '/users/' + seedUser.id)
    .set('Content-Type', 'application/json')
    .send({
      access_token: seedUser.token,
      interests: ["bikramYoga", "ddpYoga"]
    })
    .end(function(res){
      var settings = res.body;
      expect(res.status).toEqual(200);
      // find that user and check the values now
      User
      .findOne({ _id: seedUser.id })
      .lean()
      .exec(function(err, user){
        expect(user.interests).toEqual(["bikramYoga", "ddpYoga"]);
        done();
      });
    });
  });
  it("should be able to change their image", function(done) {
    agent
    .post(URL + '/users/' + seedUser.id)
    .set('Content-Type', 'application/json')
    .send({
      access_token: seedUser.token,
      userImage: seedImage._id
    })
    .end(function(res){
      var settings = res.body;
      expect(res.status).toEqual(200);
      // find that user and check the values now
      User
      .findOne({ _id: seedUser.id })
      .lean()
      .exec(function(err, user){
        expect(user.userImage).toEqual(seedImage._id.toString());
        done();
      });
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
      // find that user and check the values now
      User
      .findOne({ _id: seedUser.id })
      .lean()
      .exec(function(err, user){
        expect(user.devices.length).toEqual(1);
        done();
      });
    });
  });
});
