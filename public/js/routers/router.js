var app = app || {};
var Router = Backbone.Router.extend({
  routes: {
    'test': 'test'
  },
  test: function(param) {
    console.log('route @ test');
  }
});

app.Router = new Router();
Backbone.history.start();
