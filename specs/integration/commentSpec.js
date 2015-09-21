var agent = require('superagent');
var config = require("../../config.js");
var Promise = require('bluebird');
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var Comment = require('../../models/comment.js');
var Post = require('../../models/post.js');
//var httpMocks = require('node-mocks-http');
Promise.promisifyAll(fixture);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

// complete post for testing
var post = {
  text: 'This is a post description',
  images: ['uhn43civzs6m1c9uurqvr', 'uhn43civzs6m1c9uurqvj', 'uhn43civzs6m1c9uurqvo'],
  interests: ['yogaBikram', 'meditationZen'],
  latitude: 37.796096, //San fran, google maps shows lat/lng order
  longitude: -122.418145
};

var comment = {
  text: "Example Comment"
};

var image;
var seedUser;
var seedPost;
var seedComment;

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
      // add device token/id to user
      user.model.addDevice({
        time: Date.now(),
        token: 'a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95',
        platform: 'ios'
      }, function(err, user){
        return fixture.seedImageAsync({});
      });
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
    .get(URL + '/posts/' + seedPost._id + '/comments')
    .set('Content-Type', 'application/json')
    .query({ access_token: seedUser.token })
    .query({ page: 1 })
    .end(function(res){
      var comments = res.body;
      expect(res.status).toEqual(200);
      expect(comments.length).toBeDefined();
      expect(comments.length).toEqual(1);

      expect(comments[0].author.username).toEqual(seedUser.username);
      // make sure no sensitive user information made in through
      expect(comments[0].author.password).not.toBeDefined();
      // make sure it has a date returned gh #51
      expect(comments[0].createDate).toBeDefined();

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
