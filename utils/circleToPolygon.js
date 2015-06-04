/**
 * Convert a circle to a polygon with radius and number of sides specified
 * @param {object} options The options for the polygon estimate
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} radius in km
 * @property {number} number of sides for the polygon to be created
 * @returns {array} coordinates of polygon that approxmiates the circle ex. [[lng,lat],[lng,lat]]
 */
module.exports.circleToPolygon = function circleToPolygon(options){
  var points = options.sides;
  var radius = options.radius;
  var lng = options.longitude;
  var lat = options.latitude;

  var d2r = Math.PI / 180;   // degrees to radians
  var r2d = 180 / Math.PI;   // radians to degrees
  var earthsradius = 6371; // radius of earth in kilometers
  var polygonPoints = []; // store our circle like polygon here
  // var radius = 1;             // radius in miles
  // find the raidus in lat/lon
  var rlat = (radius / earthsradius) * r2d;
  var rlng = rlat / Math.cos(lat * d2r);

  for (var i=0; i < points+1; i++) // one extra here makes sure we connect the
  {
    var theta = Math.PI * (i / (points/2));
    var ex = lng + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
    var ey = lat + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
    polygonPoints.push([ex, ey]);  // GeoJSON wants format of long/lat
  }
  if (circleToPolygon.length === 1) {
    return polygonPoints;
  } else {
    // just return the original point in a similar format
    return [[lng,lat]];
  }
};
