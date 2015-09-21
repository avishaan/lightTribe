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
          fixture.seedUser(user2, function(err, user){
            expect(err).toEqual(null);
            seedUser2 = user;
            done();
          });
        });
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
        expect(user.devices[0].token).toEqual("a591bde2720d89d4086beaa843f9b061a18b36b48cd0008a1f347a5ad844be95");
        done();
      });
    });
  });
});
