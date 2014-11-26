var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var image = {
  id: 'placeholder'
};

describe("An image", function() {
  it("can be uploaded", function(done) {
    agent
    .post(URL + '/images')
    .attach('image', './specs/integration/images/test.png')
    .end(function(res){
      expect(res.status).toEqual(200);
      done();
    });
  });
  it("can be retrieved after upload", function(done) {
    agent
    .get(URL + '/images/' + image.id)
    .end(function(res){
      expect(res.status).toEqual(200);
      done();
    });
  });
});
