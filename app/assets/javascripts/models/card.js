App.Card = DS.Model.extend({
  value: DS.attr(),
  suit: DS.attr(),
  decks: DS.hasMany('deck'),
  simulation: DS.belongsTo('simulation')
});
