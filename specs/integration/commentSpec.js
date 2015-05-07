var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

// complete post for testing
var post = {
  _id: "12345", //TODO: remove this fake post
  text: 'This is a post description',
  images: ['uhn43civzs6m1c9uurqvr', 'uhn43civzs6m1c9uurqvj', 'uhn43civzs6m1c9uurqvo'],
  latitude: '1234.5',
  longitude: '1234.5'
};

var comment = {
  text: "Example Comment"
};

describe("Comments", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, user){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      // seed a user
      fixture.seedUser(function(err, user){
        // save the user for later
        seedUser = user;
        expect(err).toEqual(null);
        done();
      });
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
  it("should return all the comments for a post", function(done) {
    agent
    .get(URL + '/posts/' + post._id + '/comments')
    .set('Content-Type', 'application/json')
    .query({ access_token: seedUser.token })
    .end(function(res){
      var comments = res.body;
      expect(comments.length).toBeDefined();
      expect(res.status).toEqual(200);
      done();
    });
  });
  it("should allow commenting on a post", function(done) {
    agent
    .post(URL + '/posts/' + post._id + '/comments')
    .set('Content-Type', 'application/json')
    .send(comment)
    .send({ access_token: seedUser.token })
    .end(function(res){
      var body = res.body;
      expect(body).toBeDefined();
      expect(res.status).toEqual(200);
      done();
    });
  });
});
