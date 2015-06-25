var apn = require('apn');
var config = require('../config.js');

var service = new apn.Connection({
  pfx: './certs/' + config.cert.filename,
  passphrase: config.cert.passphrase,
  production: config.cert.production
});

service.on('connected', function(openSockets) {
  console.log('Connected to Apple Notification Gateway with sockets:', openSockets);
});

service.on('error', function(error){
  console.log("error: ", error);
});

service.on('timeout', function(){
  console.log('timeout');
});

service.on('socketError', function(){

});

// send the notification
//var note = new apn.Notification();
//note.setAlertText("Test");
//note.badge = 1;
//service.pushNotification(note, "a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95");
