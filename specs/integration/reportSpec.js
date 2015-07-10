var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var Comment = require('../../models/comment.js');
var Post = require('../../models/post.js');
var Promise = require('bluebird');
//var httpMocks = require('node-mocks-http');
Promise.promisifyAll(fixture);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var user = {
  username: 'user',
  password: 'password',
};
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

var seedUser = {};
var image = {};

describe("A report", function() {
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
      console.log("saved image complete");
      console.log(savedImage);
      image = savedImage;
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
  it("should be able to be submitted for an image when inappropriate", function(done) {
    agent
    .post(URL + '/reports')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      _id: image._id,
      resource: "image"
    })
    .query({ access_token: seedUser.token })
    .end(function(res){
      expect(res.status).toEqual(200);
      done();
    });
  });
});
