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
var user;

describe("An image", function() {
  beforeEach(function(done){
    fixture.deleteDB(function(err){
      fixture.seedUser(function(err, seedUser){
        user = seedUser;
        done();
      });
    });
  });
  it("can be uploaded", function(done) {
    agent
    .post(URL + '/images')
    .auth(user.username, user.password)
    .attach('file', './specs/integration/images/test.png')
    .end(function(res){
      expect(res.status).toEqual(200);
      expect(res.body._id).toBeDefined();
      // save the image id for future use
      image.id = res.body._id;
      done();
    });
  });
  it("url can be retrieved after upload", function(done) {
    agent
    .get(URL + '/images/' + image.id)
    .auth(user.username, user.password)
    .end(function(res){
      //console.log(res.body);
      expect(res.status).toEqual(200);
      expect(res.body.url).toEqual(cloudinary.url(image.id));
      done();
    });
  });
});
