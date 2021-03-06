// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require vendor/underscore
//= require vendor/crossfilter.min
//= require vendor/d3.v3.min
//= require vendor/dc.min
//= require handlebars
//= require ember
//= require ember-data
//= require vendor/ember-simple-auth
//= require vendor/ember-easyForm.min
//= require_self
//= require dogejack
//= require vendor/bootstrap.min

// for more details see: http://emberjs.com/guides/application/
App = Ember.Application.create();

//= require_tree .
