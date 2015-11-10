/* Schema */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = require('../../models/user.js');
var Post = require('../../models/post.js');

mongoose.set('debug', true);

/* Mongo connect */

var conn = mongoose.connect('mongodb://localhost/LightTribe');
// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err);
});
/* Test case */

Post
.aggregate([
  // Stage 1
{
  $match: {
    author: "56403925678ee66e96c5733c"
  }
},
// Stage 2
{
  $project: {
    interests: 1
  }
},
// Stage 3
{
  $unwind: "$interests"
},
// Stage 4
{
  $group: {
    _id: { interests: "$interests" },
    count: { $sum: 1 }
  }
}
], function(err, interests){
  console.log(interests);
});
