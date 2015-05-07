var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');
var cloudinary = require('cloudinary');

// config cloudinary
cloudinary.config(config.cloudinary);

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var image = {
  id: 'placeholder'
};
var seedUser;

describe("An image", function() {
  jasmine.getEnv().defaultTimeoutInterval = 20000;
  beforeEach(function(done){
    fixture.deleteDB(function(err){
      fixture.seedUser(function(err, user){
        seedUser = user;
        done();
      });
    });
  });
  it("can be uploaded", function(done) {
    agent
    .post(URL + '/images')
    .field('access_token', seedUser.token)
    .attach('file', './specs/integration/images/test.png')
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body._id).toBeDefined();
      // save the image id for future use
      image.id = res.body._id;
      done();
    });
  });
  it("can be retrieved after upload", function(done) {
    agent
    .post(URL + '/images')
    .field('access_token', seedUser.token)
    .attach('file', './specs/integration/images/test.png')
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body._id).toBeDefined();
      // save the image id for future use
      image.id = res.body._id;
      agent
      .get(URL + '/images/' + image.id)
      .send({ access_token: seedUser.token })
      .end(function(res){
        //console.log(res.body);
        expect(res.status).toEqual(200);
        expect(res.body.url).toBeDefined();
        done();
      });
    });
  });
  it("can request an image that doesn't exist", function(done) {
    agent
    .get(URL + '/images/' + '123a')
    .send({ access_token: seedUser.token })
    .end(function(res){
      //console.log(res.body);
      expect(res.status).toEqual(500);
      done();
    });
  });
});
