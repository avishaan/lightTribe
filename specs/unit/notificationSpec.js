
var agent = require('superagent');
var config = require("../../config.js");
var Promise = require('bluebird');
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var Comment = require('../../models/comment.js');
var Post = require('../../models/post.js');

var apns = require('../../notifications/apns.js');
var apn = require('apn');
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
    spyOn(apns.service, 'pushNotification').andCallThrough();
    runs(function(){
      Comment.createComment({
        text: "Test Text",
        author: comment.author,
        parent: comment.parent
      }, function(err, savedComment){
        // now new comment was created which should also create push notification
      });
    });
    waitsFor(function(){
      // wait until that spied obj has been called 1 time
      return apns.service.pushNotification.callCount === 1;
    }, "Expect queue dream to finish and be called", 1000);
    runs(function(){
      // make sure the notification was only sent once
      expect(apns.service.pushNotification.callCount).toEqual(1);
      // find the parent post of the comment
      Post
      .findOne({ _id: comment.parent })
      .populate('author')
      .lean()
      .exec(function(err, savedPost){
        // find the device id of that author
        var notifiedDevice = apns.service.pushNotification.mostRecentCall.args[1];
        // check the payload device token matches the device token of the author
        expect(notifiedDevice).toEqual(savedPost.author.devices[0].token);
        done();

      });
    });

  });
});
