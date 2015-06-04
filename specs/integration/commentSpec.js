var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var Comment = require('../../models/comment.js');
var Post = require('../../models/post.js');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

// complete post for testing
var post = {
  id: '1234',
  text: 'This is a post description',
  images: ['uhn43civzs6m1c9uurqvr', 'uhn43civzs6m1c9uurqvj', 'uhn43civzs6m1c9uurqvo'],
  latitude: 37.796096, //San fran, google maps shows lat/lng order
  longitude: -122.418145
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
    .get(URL + '/posts/' + post.id + '/comments')
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
    .post(URL + '/posts/' + post.id + '/comments')
    .set('Content-Type', 'application/json')
    .send(comment)
    .query({ access_token: seedUser.token })
    .end(function(res){
      var comment = res.body;
      expect(comment).toBeDefined();
      expect(res.status).toEqual(200);
      expect(comment.id).toBeDefined();
      // make sure parent of comment is the post
      Comment
      .findOne({_id: comment.id})
      .exec(function(err, comment){
        expect(comment.parent.toString()).toEqual(post.id);
        done();
      });
    });
  });
});
