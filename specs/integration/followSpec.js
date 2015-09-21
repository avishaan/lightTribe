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
  it("should allow user1 to follow user2", function(done) {
    agent
    .post(URL + '/follows')
    .set('Content-Type', 'application/json')
    .send({
      access_token: seedUser1.token,
      userId: seedUser2._id
    })
    .end(function(res){
      var settings = res.body;
      expect(res.status).toEqual(200);
      // find the user model and make sure that they no longer follow that person
      User
      .findOne(seedUser1._id)
      .lean()
      .exec(function(err, user){
        expect(user.follows[0]).toEqual(seedUser2.id);
        done();
      });
    });
  });
});
