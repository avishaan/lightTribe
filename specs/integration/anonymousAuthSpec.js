var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');
var chance = new require('chance').Chance();
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

var seedUser = {};

describe("An anonymous user", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, user){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      // seed a user
      fixture.seedUser(function(err, user){
        expect(err).toEqual(null);
        seedUser = user;
        done();
      });
    });
  });
  it("should be able to authenticate with only a GUID", function(done) {
    agent
    .post(URL + '/auths/anonymous')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/json')
    .send({
      username: "Iwantthisusername",
      GUID: chance.guid()
    })
    .end(function(res){
      console.log(res.error);
      expect(res.status).toEqual(200);
      expect(res.body.uid).toBeDefined();
      expect(res.body.password).not.toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.token).not.toEqual('placeholder');
      expect(res.body.username).toBeDefined();
      done();
    });
  });
});
