
var agent = require('superagent');
var config = require("../../config.js");
var Promise = require('bluebird');
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var Comment = require('../../models/comment.js');
var Post = require('../../models/post.js');
//var httpMocks = require('node-mocks-http');
Promise.promisifyAll(fixture);

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

describe("Notifications", function() {
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
  it("should trigger when a comment is made", function(done) {

  });
});
