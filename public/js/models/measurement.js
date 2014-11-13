var app = app || {};
app.Measurement = Backbone.Model.extend({
  defaults: {
    value: '100',
    time: '2014-11-01T01:04:47.494Z'
  },
  urlRoot: '/api/v1/phone',
  toJSON: function() {
    var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
    json.cid = this.cid;
    return json;
  }
});
