var agent = require('superagent');
var config = require("../../config.js");
var fixture = require('./../fixtures/fixture.js');
var User = require('../../models/user.js');

var apiVersion = '/v1';
var URL = config.apiURI + ':' + config.expressPort + "/api" + apiVersion;

xdescribe("A registered user interested in deleting their information", function() {
  // delete the database before each time
  beforeEach(function(done){
    fixture.deleteDB(function(err, user){
      // make sure it was able to delete the database ok
      expect(err).toEqual(null);
      // then seed the db with a user
      fixture.seedMeasurements(function(err, user){
        expect(err).toEqual(null);
        done();
      });
    });
  });
  it("should be able to request delete information", function(done) {
    [
      { sent: 'erase', received: 'Once you erase, the data is gone forever. If you are sure type ERASE ALL'},
      { sent: 'ERASE', received: 'Once you erase, the data is gone forever. If you are sure type ERASE ALL'},
      { sent: 'Erase', received: 'Once you erase, the data is gone forever. If you are sure type ERASE ALL'}
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
  it("should be able to confirm delete request successfully", function(done) {
    [
      { sent: 'ERASE ALL', received: 'Your data has been erased permanently.'},
      { sent: 'ERASE ALL', received: 'Your data has been erased permanently.'},
      { sent: 'ERASE ALL', received: 'Your data has been erased permanently.'}
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
          // make sure the user no longer exists
          User.lookup({phone: '+18001231234'}, function(err, user){
            expect(err).toEqual(null);
            expect(user).toEqual(null);
            // once we come to the end of the array, call done
            if (index === (array.length-1)){
              done();
            }
          });
        });
      });
    });
  });
});
