var agent = require('superagent');
var config = require("../../config.js");
var Promise = require('bluebird');
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var Post = require('../../models/post.js');
//var httpMocks = require('node-mocks-http');
Promise.promisifyAll(fixture);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

// complete post for testing
var post = {
  id: '1234',
  text: 'This is a post description',
  //images: ['uhn43civzs6m1c9uurqvr', 'uhn43civzs6m1c9uurqvj', 'uhn43civzs6m1c9uurqvo'],
  images: ['558d23ce7189b21400bef51b', '558d23ce7189b21400bef51b', '558d23ce7189b21400bef51b'],
  interests: ['yogaBikram', 'meditationZen'],
  latitude: 37.796096, //San fran, google maps shows lat/lng order
  longitude: -122.418145,
  privacy: "public"
};

var seedPost;

describe("Creating a post", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, user){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      // seed image so we have it for the user
      fixture.seedImage({}, function(err, image){
        fixture.seedUser({
          username: 'test',
          password: 'test',
          email: 'test@test.com',
          interests: ['yogaBikram', 'yogaVinyasa'],
          userImage: image._id
        }, function(err, user){
          // save the user for later
          seedUser = user;
          expect(err).toEqual(null);
          done();
        });
      });
      // seed a user
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
      //console.log(res.error);
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
      expect(body.author).toEqual(seedUser.id);
      expect(body.interests).toEqual(post.interests);
      done();
    });
  });
  it("should return all the posts for a specifc user", function(done) {
    // create the post
    agent
    .post(URL + '/posts')
    .set('Content-Type', 'application/json')
    .send(post)
    .send({ access_token: seedUser.token })
    .end(function(res){
      // do the test
      agent
      .get(URL + '/users/' + seedUser.id + '/posts')
      .set('Content-Type', 'application/json')
      .query({ access_token: seedUser.token })
      .query({ page: 1 })
      .end(function(res){
        var posts = res.body;
        posts.forEach(function(post){
          expect(post.author).toEqual(seedUser.id);
        });
        expect(posts.length).not.toEqual(0);
        expect(res.status).toEqual(200);
        done();
      });
    });
  });
  it("should return all users who commented on a specific post", function(done) {
    fixture
    .seedPostAsync({
      text: "Post text test",
      author: seedUser.id,
      images: [],
      interests: [],
      longitude: 10,
      latitude: 10
    })
    .then(function(post){
      return fixture.seedCommentAsync({
        text: "Comment text test",
        author: seedUser.id,
        parent: post.id
      });
    })
    .then(function(comment){
      var postId = comment.parent;
      // finished
      agent
      .get(URL + '/posts/' + postId + '/users')
      .set('Content-Type', 'application/json')
      .query({ access_token: seedUser.token })
      .query({ page: 1 })
      .end(function(res){
        var users = res.body;
        expect(users.length).not.toEqual(0);
        expect(users[0].username).toBeDefined();
        expect(res.status).toEqual(200);
        done();
      });
    })
    .caught(function(err){
      console.log(err);
      throw new Error(err);
    });
    // seedComment
    // agent
    // .get(URL + '/posts/' + post.id + '/users')
    // .set('Content-Type', 'application/json')
    // .query({ access_token: seedUser.token })
    // .query({ page: 1 })
    // .end(function(res){
    //   var users = res.body;
    //   expect(users.length).not.toEqual(0);
    //   expect(users[0].user.username).toBeDefined();
    //   expect(res.status).toEqual(200);
    //   throw new Error('Check this test');
    //   done();
    // });
  });
  it("should allow images to be retrieved and attached from/to a post #68", function(done) {
    // we probably don't need this as we already are testing image resolution correctly and we are resolving the image information independently of querying the post. Because we are doing this independently we removed a bunch of testing and complexity for ourselves
    var image = {};
    // seed the image
    agent
    .post(URL + '/images')
    .field('access_token', seedUser.token)
    .attach('file', './specs/integration/images/test.png')
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body._id).toBeDefined();
      // save the image id for future use

      image._id = res.body._id;
      // replace image in our dummy post
      var imagePost = post;
      imagePost.images = [image._id];
      // upload
      agent
      .post(URL + '/posts')
      .set('Content-Type', 'application/json')
      .send(imagePost)
      .send({ access_token: seedUser.token })
      .end(function(res){
        var body = res.body;
        imagePost.id = body._id;
        // now get that post
        Post
        .findOne({_id: imagePost.id})
        .lean()
        .exec(function(err, post){
          // make sure image id in the post is the same as we passed in
          expect(imagePost.images[0].toString()).toEqual(post.images[0]);
          // send image.id of post to resolve to url
          agent
          .get(URL + '/posts/' + imagePost.id)
          .send({ access_token: seedUser.token })
          .end(function(res){
            var post = res.body;
            expect(post.images[0].url).toBeDefined();
            expect(post.author.username).toBeDefined();
            expect(post.author).toBeDefined();
            // get all the users posts and check for image gh #68
            agent
            .get(URL + '/users/' + seedUser.id + '/posts')
            .set('Content-Type', 'application/json')
            .query({ access_token: seedUser.token })
            .query({ page: 1 })
            .end(function(res){
              var posts = res.body;
              expect(posts[0].images).toBeDefined();
              expect(posts[0].images[0].url).toBeDefined();
              done();
            });
          });
          //agent
          //.get(URL + '/images/' + post.images[0])
          //.send({ access_token: seedUser.token })
          //.end(function(res){
          //  //console.log(res.body);
          //  expect(res.status).toEqual(200);
          //  expect(res.body.url).toBeDefined();
          //});
        });
      });
    });
  });
});

describe("Search posts", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, db){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      fixture.seedImage(function(err, image){
        // setup user image and post image
        post.images = [image._id.toString()];
        // seed a user
        fixture.seedUser({
          username: 'testJasmine',
          password: 'test123',
          email: 'test@email.com',
          interests: ['yogaBikram', 'yogaVinyasa'],
          userImage: image._id.toString()
        },
        function(err, user){
          expect(err).toEqual(null);
          // save the user for later
          seedUser = user;
          // setup post related items, such as the author
          post.author = seedUser._id.toString();
          fixture.seedPost(post, function(err, post){
            seedPost = post;
            done();
          });
        });

      });
    });
  });
  it("should be returned based on query parameters", function(done) {
    agent
    .get(URL + '/posts')
    .set('Content-Type', 'application/json')
    .query({ access_token: seedUser.token })
    .query({ interests: 'yogaBikram, yogaBikram2' })
    .query({ radius: 50 })
    .query({ latitude: post.latitude })
    .query({ longitude: post.longitude })
    .query({ page: 1 })
    .end(function(res){
      var posts = res.body;
      expect(posts.length).not.toEqual(0);
      // make sure response matches correctly
      var post = posts[0];
      expect(post.author.username).toBeDefined();
      expect(post.author._id).toBeDefined();
      expect(post.author.userImage.url).toBeDefined();
      expect(res.status).toEqual(200);
      done();
    });
  });
  it("should NOT return anything within correct search radius", function(done) {
    agent
    .post(URL + '/posts')
    .set('Content-Type', 'application/json')
    .send(post)
    .send({ access_token: seedUser.token })
    .end(function(res){
      Post.readPostsBySearch({
        // 34.0204989,-118.4117325 los angeles actual distance 560km
        latitude: 34.0204989,
        longitude: -118.4117325,
        radius: 500
      }, function(err, posts){
        expect(posts.length).toEqual(0);
        expect(err).toEqual(null);
        done();
      });
    });
  });
  it("should return anything inside the search radius", function(done) {
    agent
    .post(URL + '/posts')
    .set('Content-Type', 'application/json')
    .send(post)
    .send({ access_token: seedUser.token })
    .end(function(res){
      Post.readPostsBySearch({
        // 34.0204989,-118.4117325 los angeles actual distance 560km
        latitude: 34.0204989,
        longitude: -118.4117325,
        radius: 600
      }, function(err, posts){
        expect(posts.length).toEqual(2);
        expect(err).toEqual(null);
        done();
      });
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
