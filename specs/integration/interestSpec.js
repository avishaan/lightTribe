var agent = require('superagent');
var config = require("../../config.js");
var Promise = require('bluebird');
var Interests = require("../../models/interests.js").Interests;
var fixture = require('./../fixtures/fixture.js');
//var httpMocks = require('node-mocks-http');
Promise.promisifyAll(fixture);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;


describe("Comments", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture
    .deleteDBAsync({})
    .then(function(dbInfo){
      return fixture.seedUserAsync({});
    })
    .then(function(user){
      // save the user for later
      seedUser = user;
      return fixture.seedImageAsync({});
    })
    .then(function(savedImage){
      post.images = [savedImage];

      // setup post related items, such as the author
      post.author = seedUser._id.toString();
      return fixture.seedPostAsync(post);
    })
    .then(function(savedPost){
      seedPost = savedPost.toJSON();

      // setup comment related items
      comment.author = seedUser._id;
      comment.parent = seedPost._id;
      return fixture.seedCommentAsync(comment);
    })
    .then(function(end){
      done();
    })
    .caught(function(err){
      console.log("Error: ", err);
    });
  });
  it("should return all the comments for a post", function(done) {
    agent
    .get(URL + '/posts/' + seedPost._id + '/comments')
    .set('Content-Type', 'application/json')
    .query({ access_token: seedUser.token })
    .end(function(res){
      var comments = res.body;
      expect(res.status).toEqual(200);
      expect(comments.length).toBeDefined();
      expect(comments.length).toEqual(1);

      expect(comments[0].author.username).toEqual(seedUser.username);
      // make sure no sensitive user information made in through
      expect(comments[0].author.password).not.toBeDefined();
      done();
    });
  });
  it("should allow commenting on a post", function(done) {
    agent
    .post(URL + '/posts/' + seedPost._id + '/comments')
    .set('Content-Type', 'application/json')
    .send(comment)
    .query({ access_token: seedUser.token })
    .end(function(res){
      var comment = res.body;
      expect(comment).toBeDefined();
      expect(res.status).toEqual(200);
      expect(comment._id).toBeDefined();
      // make sure parent of comment is the post
      Comment
      .findOne({_id: comment._id})
      .exec(function(err, comment){
        expect(comment.parent.toString()).toEqual(seedPost._id.toString());
        done();
      });
    });
  });
});
