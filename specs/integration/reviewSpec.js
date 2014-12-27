var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

// complete review for testing
var review = {
  company: 'Company Name',
  description: 'This is a description',
  rating: 1,
  images: ['uhn43civzs6m1c9uurqvr', 'uhn43civzs6m1c9uurqvj', 'uhn43civzs6m1c9uurqvo'],
  datetime: new Date().toJSON(),
  location: '1234.5, 1234.6'
};

describe("Posting a review", function() {
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
    .post(URL + '/reviews')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send(review)
    .end(function(res){
      expect(res.status).toEqual(401);
      done();
    });
  });
  it("should require a valid authentication token to access", function(done) {
    agent
    .post(URL + '/reviews')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send(review)
    .send({ access_token: 'wrongtoken' })
    .end(function(res){
      expect(res.status).toEqual(401);
      done();
    });
  });
  it("should be able to be submitted successfully", function(done) {
    agent
    .post(URL + '/reviews')
    .set('Content-Type', 'application/json')
    .send(review)
    .send({ access_token: seedUser.token })
    .end(function(res){
      var body = res.body;
      expect(res.status).toEqual(200);
      expect(body._id).toBeDefined();
      expect(body.company).toEqual(review.company);
      expect(new Date(body.datetime).toJSON()).toEqual(review.datetime);
      expect(body.description).toEqual(review.description);
      expect(body.images).toEqual(review.images);
      expect(body.location).toEqual(review.location);
      expect(body.rating).toEqual(review.rating);
      expect(body.submitter).toEqual(seedUser.id);
      done();
    });
  });
  xit("should require a company name", function(done) {
    agent
    .post(URL + '/reviews')
    .set('Content-Type', 'application/json')
    .send({ access_token: seedUser.token })
    .send({
      description: review.description,
      rating: review.rating,
      images: review.images,
      datetime: review.datetime,
      location: review.location
    })
    .end(function(res){
      // TODO need specific error message describing what is missing
      expect(res.status).toEqual(400);
      done();
    });
  });
});
