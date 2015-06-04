    /* Schema */
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    mongoose.set('debug', true);

    var AreaSchema = new Schema({
      name: String,
      loc: {
        type : { type : String, default : 'Polygon' },
        coordinates: []
      }
    });
    AreaSchema.index({loc: '2dsphere'});

    mongoose.model('Area', AreaSchema);
    var Area = mongoose.model('Area');
    /* Mongo connect */

    var conn = mongoose.connect('mongodb://localhost/geoPolygonExample');
    // Error handler
    mongoose.connection.on('error', function (err) {
      console.log(err);
    });
    /* Test case */
    // San Francisco coordinates
    var SF =
    [
      [
        [-122.40676401697,37.796096 ], 
        [-122.408288779576,37.80059260802959 ],
        [-122.412454508485,37.80388435356898 ],
        [-122.418145,37.80508921605919 ], 
        [-122.423835491515,37.80388435356898 ],
        [-122.428001220424,37.80059260802959 ],
        [-122.42952598303,37.796096 ], 
        [-122.428001220424,37.79159939197041 ],
        [-122.423835491515,37.78830764643102 ],
        [-122.418145,37.78710278394081 ], 
        [-122.412454508485,37.78830764643102 ],
        [-122.408288779576,37.79159939197041 ],
        [-122.40676401697,37.796096  ]
      ]
    ];
    var my_area = new Area({
      "name": "Test",
      "loc": {
        "coordinates": SF,
        //"type" : "MultiPoint" // coordinate format multipoint [[lng,lat],[lng,lat]]
        //"type" : "Point" // coordinate format point [lng,lat] *dbl check this
        "type": "Polygon"  // coordinate format polygon [[[lng,lat],[lng,lat]]]
      }
    });
    my_area.save( function (err) {
      // now we want to see if San Francisco (GeoJSON polygon/multipoint) is within 600 miles from LA (GeoJSON point)
      // SF is ~560 miles from the picked out LA point
      var LA = [-118.4117325, 34.0204989];
      var distance = 600/6371;

      Area
      .find({})
      .where('loc')
      .near({
        center: LA,
        maxDistance: distance,
        spherical: true
      })
      .exec(function(err, areas){
        console.log("near query");
        console.log("err: ", err);
        console.log("areas: ", areas);
      //* result: err:  { [MongoError: n/a]
      //* name: 'MongoError',
      //* message: 'n/a',
      //* '$err': 'Unable to execute query: error processing query: ns=geoPolygonExample.areas limit=1000 skip=0\nTree: GEONEAR  field=loc.coordinates maxdist=0.0156961 isNearSphere=0\nSort: {}\nProj: {}\n planner returned error: unable to find index for $geoNear query',
      //* code: 17007 }
      //* areas:  undefined
      });
      Area
      .find({})
      .where('loc')
      .within({
        center: LA,
        //radius: 100/6371,
        radius: distance,
        spherical: true
      })
      .exec(function(err, areas){
        console.log("within query");
        console.log("err: ", err);
        console.log("areas: ", areas);
      });

      Area
      .find({})
      .where('loc')
      .within()
      .circle({
        center: LA,
        radius: distance,
        spherical: true
      })
      .exec(function(err, areas){
        console.log("circle query");
        console.log("err: ", err);
        console.log("areas: ", areas);
      });

      Area
      .geoNear({
        type: 'Point',
        coordinates: LA
      },{
        maxDistance: distance,
        spherical: true
      }, function(err, areas, stats){
        console.log("geoNear search");
        console.log("err: ", err);
        console.log("areas: ", areas);
      });
    });
