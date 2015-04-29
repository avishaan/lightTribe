var app = app || {};

app.AppView = Backbone.View.extend({
  el: '#templateView',
  initialize: function(template) {
    this.model = new app.Measurement({id: '+18001231234'});
    this.model.fetch();
    console.log('init');
    this.render();
    // get the collection around this time
  },
  render: function() {
    // get a model from the collection
    // render some stuff to the view
    console.log('render');
  }
});
