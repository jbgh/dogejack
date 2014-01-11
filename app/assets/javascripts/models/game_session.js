App.GameSession = DS.Model.extend ({
  playedCards: DS.attr('raw'),
  games: DS.hasMany('game'),
  numberOfDecks: DS.attr(),
  penetrationLevel: DS.attr(),

  high: function(){
    return this.get('playedCards').reject(function(card){return parseInt(card) < 10}).length;
  }.property('playedCards'),

  low: function(){
    convertedCards = this.get('playedCards').reject(function(card){return isNaN(parseInt(card))});
    return convertedCards.reject(function(card){return parseInt(card) > 6 }).length;
  }.property('playedCards'),

  penetration: function(){
    return Math.floor(this.get('penetrationLevel') * 100);
  }.property('penetrationLevel'),

  runningCount: function(){
    return this.get('low') - this.get('high');
  }.property('low', 'high'),

  truecount: function(){
    return this.get('runningCount') / (this.get('penetrationLevel') * this.get('numberOfDecks'));
  }.property('runningCount', 'penetrationLevel', 'numberOfDecks')

});