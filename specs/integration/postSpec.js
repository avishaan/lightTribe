var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

// complete post for testing
var post = {
  text: 'This is a post description',
  images: ['uhn43civzs6m1c9uurqvr', 'uhn43civzs6m1c9uurqvj', 'uhn43civzs6m1c9uurqvo'],
  latitude: '1234.5',
  longitude: '1234.5'
};

describe("Creating a post", function() {
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
  it("should require access_token to be filled out", function(done) {
    agent
    .post(URL + '/posts')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send(post)
    .end(function(res){
      expect(res.status).toEqual(401);
      done();
    });
  });
  it("should require a valid authentication token to access", function(done) {
    agent
    .post(URL + '/posts')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send(post)
    .send({ access_token: 'wrongtoken' })
    .end(function(res){
      expect(res.status).toEqual(401);
      done();
    });
  });
  it("should give information on the validation error", function(done) {
    agent
    .post(URL + '/posts')
    .set('Content-Type', 'application/json')
    .send({ access_token: seedUser.token })
    .send({
      images: post.images,
      latitude: post.latitude,
      longitude: post.longitude
    })
    .end(function(res){
      // TODO need specific error message describing what is missing
      console.log(res.error);
      // make sure the body is not empty
      expect(res.body.error).not.toBe({});
      expect(res.body.error).toBeDefined();
      expect(res.status).toEqual(400);
      done();
    });
  });
  it("should require a text field to be filled out", function(done) {
    agent
    .post(URL + '/posts')
    .set('Content-Type', 'application/json')
    .send({ access_token: seedUser.token })
    .send({
      images: post.images,
      latitude: post.latitude,
      longitude: post.longitude
    })
    .end(function(res){
      expect(res.status).toEqual(400);
      done();
    });
  });
  it("should be able to be submitted successfully", function(done) {
    agent
    .post(URL + '/posts')
    .set('Content-Type', 'application/json')
    .send(post)
    .send({ access_token: seedUser.token })
    .end(function(res){
      var body = res.body;
      expect(res.status).toEqual(200);
      expect(body._id).toBeDefined();
      expect(body.text).toEqual(post.text);
      expect(body.images).toEqual(post.images);
      expect(body.latitude).toEqual(post.latitude);
      expect(body.longitude).toEqual(post.longitude);
      expect(body.author).toEqual(seedUser.id);
      done();
    });
  });
});

//TODO remove this for production
xdescribe("Posts", function() {
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
        // seed review
        fixture.seedReview({user: seedUser},function(err, review){
          expect(err).toEqual(null);
          done();
        });
      });
    });
  });
  it("should be retrievable in list form by a user", function(done) {
    agent
    .get(URL + '/posts')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .query({access_token: seedUser.token})
    .end(function(res){
      var posts = res.body;
      expect(posts.length).toEqual(1);
      expect(posts[0]._id).toBeDefined();
      expect(res.status).toEqual(200);
      done();
    });
  });
  it("should be retrievable even when imageid in post is not real", function(done) {
    // post a post with fake images
    agent
    .post(URL + '/posts')
    .set('Content-Type', 'application/json')
    .send(post)
    .send({ access_token: seedUser.token })
    .end(function(res){
      var body = res.body;
      agent
      .get(URL + '/posts')
      //.get('http://localhost:3000/api/v1/templates')
      .set('Content-Type', 'application/json')
      .query({access_token: seedUser.token})
      .end(function(res){
        var posts = res.body;
        expect(res.status).toEqual(200);
        expect(posts.length).toEqual(2);
        // make sure one of them has images populated
        expect(posts[0].images.length || posts[1].images.length).toBeTruthy();
        // make sure one of them doesn't have images populated (yes, not a great test)
        expect(posts[0].images.length && posts[1].images.length).toBeFalsy();
        done();
      });
    });
  });
});
