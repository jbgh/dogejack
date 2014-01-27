App.Popover = Ember.View.extend({
  templateName: 'simulation',

  didInsertElement: function(){
    this.$(".form-control").popover();
  }
});