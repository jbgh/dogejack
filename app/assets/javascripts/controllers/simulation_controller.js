App.SimulationController = Ember.ArrayController.extend({
  simulating: false,
  lowBankroll: 0,
  highBankroll: 0,
  endingBankroll: 0,
  standardDeviation: 0,
  averageBet: 0,
  maxBet: 0,

  cardMultiplier: function(){
    return parseInt(this.get('deckCount'), 10) * 4;
  }.property('content'),

  shoe: function(){
    var that = this;
    var all_cards = [];
    for (var i = 0; i < parseInt(that.get('cardMultiplier'), 10); i++) {
      all_cards.push(that.get('content')); }
    return _.flatten(all_cards);
  }.property('content'),

  actions: {
    simulate: function(){
      var that = this;

      var worker = new Worker('/assets/simulation_worker.js');

      worker.addEventListener('message', function(e) {
        var data = e.data;
        if (typeof(e.data) === 'number'){
          that.set('standardDeviation', e.data);
        } else {
          debugger;
        var simulationData = crossfilter(data);
        var endBankrolls = simulationData.dimension(function(d) { return d.endbankroll; } );
        that.set('highBankroll', endBankrolls.top(1)[0].endbankroll);
        that.set('lowBankroll', endBankrolls.bottom(1)[0].endbankroll);
        }
      }, false);

      worker.postMessage({'bet': parseInt(that.get('baseBet'), 10), 'tablemin': parseInt(that.get('tableMin'), 10),
        'startbank': parseInt(that.get('startingBankroll'), 10), 'shoe': that.get('shoe'),
        'handssimulated': parseInt(that.get('handsSimulated'), 10)});

    }
  }
});

