var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var user = {
  username: 'user',
  password: 'password',
};

// complete review for testing
var review = {
  company: 'Company Name',
  description: 'This is a description',
  rating: 1,
  images: ['1234', '1235', '1236'],
  datetime: Date.now(),
  location: '1234.5, 1234.6'
};

var seedUser = fixture.seededUser;

describe("Posting a review", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, user){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      // seed a user
      fixture.seedUser(function(err, user){
        expect(err).toEqual(null);
        done();
      });
    });
  });
  it("should require authentication to access", function(done) {
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
  it("should be able to be submitted successfully", function(done) {
    agent
    .post(URL + '/reviews')
    .set('Content-Type', 'application/json')
    .auth(seedUser.username, seedUser.password)
    .send(review)
    .end(function(res){
      expect(res.status).toEqual(200);
      done();
    });
  });
  xit("should require a company name", function(done) {
    agent
    .post(URL + '/reviews')
    .set('Content-Type', 'application/json')
    .auth(seedUser.username, seedUser.password)
    .send({
      description: review.description,
      rating: review.rating,
      images: review.images,
      datetime: review.datetime,
      location: review.location
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      done();
    });
  });
});
