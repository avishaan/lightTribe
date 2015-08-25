var agent = require('superagent');
var config = require("../../config.js");
var Promise = require('bluebird');
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var Comment = require('../../models/comment.js');
//var httpMocks = require('node-mocks-http');
Promise.promisifyAll(fixture);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var user1;
var user2;

describe("Messages", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture
    .deleteDBAsync({})
    .then(function(dbInfo){
      return fixture.seedUserAsync({});
    })
    .then(function(user){
      // save the user for later
      user1 = user;
      console.log('seed user:', user.username);
      return fixture.seedUserAsync({
        username: "test2",
        password: "password2"
      });
    })
    .then(function(user){
      // save the user for later
      user2 = user;
      console.log('seed user2:', user.username);
    })
    .then(function(end){
      done();
      console.log('done');
    })
    .caught(function(err){
      console.log("Error: ", err);
    });
  });
  //it("should require access_token to be filled out", function(done) {
  //  agent
  //  .get(URL + '/profile/' + seedUser.id)
  //  //.get('http://localhost:3000/api/v1/templates')
  //  .set('Content-Type', 'application/json')
  //  .send(post)
  //  .end(function(res){
  //    expect(res.status).toEqual(401);
  //    done();
  //  });
  //});
  //it("should require a valid authentication token to access", function(done) {
  //  agent
  //  .get(URL + '/profile/' + seedUser.id)
  //  //.get('http://localhost:3000/api/v1/templates')
  //  .set('Content-Type', 'application/json')
  //  .send(post)
  //  .send({ access_token: 'wrongtoken' })
  //  .end(function(res){
  //    expect(res.status).toEqual(401);
  //    done();
  //  });
  //});
  it("should allow user1 to message user2", function(done) {
    agent
    .post(URL + '/messages/' + user2.id)
    .set('Content-Type', 'application/json')
    .query({ access_token: user1.token })
    .send({
      text: "Hello user2, you seem cool"
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      done();
    });
  });
  it("should allow user2 to read all of it's messages", function(done) {
    // first seed the message
    agent
    .post(URL + '/messages/' + user2.id)
    .set('Content-Type', 'application/json')
    .query({ access_token: user1.token })
    .send({
      text: "test message"
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      // check the messages
      agent
      .get(URL + '/messages/' + user2.id)
      .set('Content-Type', 'application/json')
      .query({ access_token: user2.token })
      .end(function(res){
        var messages = res.body;
        expect(res.status).toEqual(200);
        expect(messages.length).toEqual(1);
        expect(messages[0].text).toEqual("test message");
        expect(messages[0].author.username).toEqual("test2");
        done();
      });
    });
  });
});
