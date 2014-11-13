var agent = require('superagent');
var config = require("../../config.js");
var sms = require("../../controllers/sms.js");
var xml2js = require('xml2js');
var parser = xml2js.parseString;
var fixture = require('./../fixtures/fixture.js');
//var httpMocks = require('node-mocks-http');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;
//var player_obj = require('../src/Player.js');
//var song_obj = require('../src/Song.js');
//var helper = require('./SpecHelper.js');

describe("An Unregistered User", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, user){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      done();
    });
  });
  it("should be told to sign up no matter what measurement is sent", function(done) {
    [
      { sent: 'Text Message Body 500', received: 'Please REGISTER first'},
      { sent: 'Text Message Body 500', received: 'Please REGISTER first'}
    ].forEach(function(req, index, array){
      agent
      .post(URL + '/sms')
      //.get('http://localhost:3000/api/v1/templates')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        From: '+18001231234',
        To: '+18001231234',
        Body: req.sent
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        // check the msg xml
        parser(res.text, function (err, json){
          // get the msg sent to the user out of the json
          msg = json.Response.Sms[0];
          expect(msg).toEqual(req.received);
          // once we come to the end of the array, call done
          if (index === (array.length-1)){
            done();
          }
        });
      });
    });
  });
});
describe("A newly registered user", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, user){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      // then seed the db with a user
      fixture.seedUser(function(err, user){
        expect(err).toEqual(null);
        done();
      });
    });
  });
  it("should be able to submit a measurement in one of many formats", function(done) {
    [
      { sent: 'Text Message Body 500', received: 'Received your measurement of: 500'},
      { sent: 'Text Message Body 500', received: 'Received your measurement of: 500'},
      { sent: 'My insulin is 500', received: 'Received your measurement of: 500'},
      { sent: '500.1', received: 'Received your measurement of: 500.1'},
      { sent: '500.1mg/dl', received: 'Received your measurement of: 500.1'},
      { sent: '500.12mg/dl', received: 'Received your measurement of: 500.12'},
      { sent: '500', received: 'Received your measurement of: 500'}
    ].forEach(function(req, index, array){
      agent
      .post(URL + '/sms')
      //.get('http://localhost:3000/api/v1/templates')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        From: '+18001231234',
        To: '+18001231234',
        Body: req.sent
      })
      .end(function(res){
        expect(res.status).toEqual(200);
        // check the msg xml
        parser(res.text, function (err, json){
          // get the msg sent to the user out of the json
          msg = json.Response.Sms[0];
          expect(msg).toEqual(req.received);
          // once we come to the end of the array, call done
          if (index === (array.length-1)){
            done();
          }
        });
      });
    });
  });
});
describe("A registered user should be able to get their last measurement back", function() {
  // pick the measurement amount
  var measurement = '500';
  it("should set up the test case", function(done) {
    fixture.deleteDB(function(err, user){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      // then seed the db with a user
      fixture.seedUser(function(err, user){
        expect(err).toEqual(null);
        done();
      });
    });
  });
  it("should be able to submit a measurement", function(done) {
    agent
    .post(URL + '/sms')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      From: '+18001231234',
      To: '+18001231234',
      Body: measurement
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      // check the msg xml
      parser(res.text, function (err, json){
        // get the msg sent to the user out of the json
        msg = json.Response.Sms[0];
        expect(msg).toEqual('Received your measurement of: 500');
        done();
      });
    });
  });
  it("should be able to get the last measurement", function(done) {
    agent
    .post(URL + '/sms')
    //.get('http://localhost:3000/api/v1/templates')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      From: '+18001231234',
      To: '+18001231234',
      Body: 'LAST'
    })
    .end(function(res){
      expect(res.status).toEqual(200);
      // check the msg xml
      parser(res.text, function (err, json){
        // get the msg sent to the user out of the json
        msg = json.Response.Sms[0];
        expect(msg).toEqual('Your last measurement was: ' + measurement);
        done();
      });
    });
  });
});
