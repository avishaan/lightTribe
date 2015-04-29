var app = app || {};

app.Measurements = Backbone.Collection.extend({
    model: app.Measurement,
    url: '/api/v1/phone'
});
