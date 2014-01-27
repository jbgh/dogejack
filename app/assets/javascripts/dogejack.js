//= require ./store
//= require_tree ./mixins
//= require_tree ./models
//= require_tree ./controllers
//= require_tree ./views
//= require_tree ./helpers
//= require_tree ./components
//= require_tree ./templates
//= require ./router
//= require ./simulation_worker
//= require_tree ./routes
//= require_tree ./initializers
//= require_self

DS.RESTAdapter.reopen({
  namespace: 'api/'
});