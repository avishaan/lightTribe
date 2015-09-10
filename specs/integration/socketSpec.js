var agent = require('superagent');
var config = require("../../config.js");
var Promise = require('bluebird');
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var Comment = require('../../models/comment.js');
var socket = require('socket.io-client')('http://localhost:3000');
//var httpMocks = require('node-mocks-http');
Promise.promisifyAll(fixture);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var user1;
var user2;

socket.on('connect', function(){
  console.log('connected');
});

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
      return fixture.seedUserAsync({
        username: "test2",
        password: "password2"
      });
    })
    .then(function(user){
      // save the user for later
      user2 = user;
    })
    .then(function(end){
      done();
    })
    .caught(function(err){
    });
  });
  it("should allow user1 to message user2", function(done) {
    agent
    .post(URL + '/conversations')
    .set('Content-Type', 'application/json')
    .query({ access_token: user1.token })
    .send({
      text: "Hello user2, you seem cool",
      recipient: user2.id
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      done();
    });
  });
  it("should trigger a socket event when a message is sent to a user", function(done) {
    // start the socket
    socket.emit('subscribe', {
      userId: user1._id
    });

    agent
    .post(URL + '/conversations')
    .set('Content-Type', 'application/json')
    .query({ access_token: user1.token })
    .send({
      text: "Hello user2, you seem cool",
      recipient: user2.id
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      done();
    });
  });
});
