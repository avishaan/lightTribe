var agent = require('superagent');
var config = require("../../config.js");
var Promise = require('bluebird');
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');
Promise.promisifyAll(fixture);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var user1;
var user2;
var seedImage;

describe("Messages", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture
    .deleteDBAsync({})
    .then(function(dbInfo){
      return fixture.seedImageAsync({});
    })
    .then(function(image){
      seedImage = image;
      return fixture.seedUserAsync({
        username: "test1",
        password: "password1",
        userImage: seedImage._id
      });
    })
    .then(function(user){
      user.userImage = seedImage._id;
      // save the user for later
      user1 = user;
      return fixture.seedUserAsync({
        username: "test2",
        password: "password2",
        userImage: seedImage._id
      });
    })
    .then(function(user){
      user.userImage = seedImage._id;
      // save the user for later
      user2 = user;
    })
    .then(function(end){
      done();
    })
    .caught(function(err){
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
  it("should allow user1 to see convo with user2 from 'profile' page", function(done){
    // gh #100
    // get the conversation id from a user we haven't messaged yet, be blank
    agent
    .get(URL + '/users/' + user2.id + '/conversations')
    .set('Content-Type', 'application/json')
    .query({ access_token: user1.token })
    .end(function(res){
      expect(res.status).toEqual(200);
      // send user a message
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
        expect(res.body.conversationId).toBeDefined();
        var conversationId = res.body.conversationId;
        // get the conversation id again from the user we now have messaged, should be populated and match
        agent
        .get(URL + '/users/' + user2.id + '/conversations')
        .set('Content-Type', 'application/json')
        .query({ access_token: user1.token })
        .end(function(res){
          expect(res.status).toEqual(200);
          expect(res.body.conversationId).toBeDefined();
          expect(res.body.conversationId).toEqual(conversationId);
          done();
        });
      });
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
      // make sure conversation id exists gh#80
      expect(res.body.conversationId).toBeDefined();
      done();
    });
  });
  it("should keep the same conversation id upon a second message to the same user", function(done) {
    var conversationId;
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
      expect(res.body.conversationId).toBeDefined();
      conversationId = res.body.conversationId;
      agent
      .post(URL + '/conversations')
      .set('Content-Type', 'application/json')
      .query({ access_token: user1.token })
      .send({
        text: "Hello user2, you still seem cool so I will message you again",
        recipient: user2.id
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        expect(res.body.conversationId).toEqual(conversationId);
        done();
      });
    });
  });
  it("should allow user2 to read all of it's conversations", function(done) {
    // first seed the message
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
      // get a list of all the conversations for a user
      agent
      .get(URL + '/conversations')
      .set('Content-Type', 'application/json')
      .query({ access_token: user2.token })
      .end(function(res){
        var conversations = res.body;
        expect(res.status).toEqual(200);
        expect(conversations.length).toEqual(1);
        expect(conversations[0]._id).toBeDefined();
        expect(conversations[0].participants).toBeDefined();
        // make sure both users are participants of a convo even if other user didn't respond gh#79
        expect(conversations[0].participants.length).toEqual(2);
        expect(conversations[0].messages).not.toBeDefined();
        expect(conversations[0].participants[0].username).toBeDefined();
        expect(conversations[0].participants[0].userImage).toBeDefined();
        expect(conversations[0].participants[0].userImage.url).toBeDefined();
        // save the conversation id for later
        var conversationId = conversations[0]._id;
        // get all the messages in the only conversation
        agent
        .get(URL + '/conversations/' + conversationId)
        .set('Content-Type', 'application/json')
        .query({ access_token: user2.token })
        .end(function(res){
          var conversation = res.body;
          //console.log(conversation.participants);
          var messages = conversation.messages;
          expect(res.status).toEqual(200);
          expect(conversation.participants.length).toEqual(2);
          expect(messages.length).toEqual(1);
          expect(conversation._id).toBeDefined();
          expect(messages[0].author).toBeDefined();
          expect(messages[0].author.username).toBeDefined();
          expect(messages[0].author.userImage).toBeDefined();
          expect(messages[0].author.userImage.url).toBeDefined();
          done();
        });
      });
    });
  });
});
