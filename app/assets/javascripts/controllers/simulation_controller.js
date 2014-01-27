App.SimulationController = Ember.ArrayController.extend({
  simulating: false,
  lowBankroll: 0,
  highBankroll: 0,
  endingBankroll: 0,
  percentComplete: "width: 0%",
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
      var simulationData = [];
      var handsSimulated = parseInt(that.get('handsSimulated'), 10);
      var startBank = parseInt(that.get('startingBankroll'), 10);
      $(".meter").show();

      var worker = new Worker('simulation_worker.js');

      worker.addEventListener('message', function(e) {

        // Debug helper
        function print_filter(filter){
          var f=eval(filter);
          if (typeof(f.length) != "undefined") {}else{}
          if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
          if (typeof(f.dimension) != "undefined")
          {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
          console.log(filter+"("+f.length+") = "+JSON.stringify
          (f).replace("[","[\n\t").replace(/}\,/g,"}, \n\t").replace("]","\n]"));
        }

        if (typeof(e.data) === 'number'){
          that.set('percentComplete', ("width: " + Math.round(((e.data * 100)) * 100) / 100) + "%");
        } else {
        simulationData.push(e.data);
        }

        if (e.data.trial === handsSimulated - 1){
          that.set('percentComplete', 100);

          // Set normalization for bankroll and count

          simulationData.forEach(function(d){
            d.normalbankroll = (d.endbankroll - _.min(simulationData, function(t){ return t.endbankroll; }).endbankroll) / (_.max(simulationData, function(t){ return t.endbankroll; }).endbankroll - _.min(simulationData, function(t){ return t.endbankroll; }).endbankroll);
            d.normalcount = (d.truecount - _.min(simulationData, function(t){ return t.truecount; }).truecount) / (_.max(simulationData, function(t){ return t.truecount; }).truecount - _.min(simulationData, function(t){ return t.truecount; }).truecount);
          });

          var simulationCF = crossfilter(simulationData);

          var endBankrolls = simulationCF.dimension(function(d) { return d.endbankroll; } );
          var trials = simulationCF.dimension(function(d) { return d.trial; });

          var normalBankrolls = trials.group().reduceSum(function(d) { return d.normalbankroll; });
          var normalTrueCounts = trials.group().reduceSum(function(d) { return d.normalcount; });
          var allBankrolls = trials.group().reduceSum(function(d){ return d.endbankroll; });

          var normalizedLineChart = dc.lineChart("#chart-line-normalized");
            normalizedLineChart
            .width(1000).height(300)
            .dimension(trials)
            .group(normalBankrolls, "Bankroll")
            .stack(normalTrueCounts, "True Count")
            .x(d3.scale.linear()
              .domain([0, handsSimulated]))
            .y(d3.scale.linear().domain([-1,1]).range([-1,1]))
            .elasticY(true)
            .elasticX(true)
            .yAxisLabel("Normalized")
            .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
            .brushOn(false)
            .renderArea(true);

          var bankrollLineChart = dc.lineChart("#chart-line-bankroll");
            bankrollLineChart
            .width(1000).height(300)
            .dimension(trials)
            .group(allBankrolls)
            .x(d3.scale.linear()
              .domain([0, handsSimulated]))
            .y(d3.scale.linear().domain([_.min(simulationData, function(t){ return t.endbankroll; }).endbankroll,_.max(simulationData, function(t){ return t.endbankroll; }).endbankroll]))
            .yAxisPadding(100)
            .yAxisLabel("Bankroll")
            .brushOn(false)
            .renderArea(true);

          dc.renderAll();

          that.set('endingBankroll', simulationData[simulationData.length - 1].endbankroll);
          that.set('highBankroll', endBankrolls.top(1)[0].endbankroll);
          that.set('lowBankroll', endBankrolls.bottom(1)[0].endbankroll);
        }
        
      }, false);

      worker.postMessage({'bet': parseInt(that.get('baseBet'), 10), 'tablemin': parseInt(that.get('tableMin'), 10),
        'startbank': parseInt(that.get('startingBankroll'), 10), 'shoe': that.get('shoe'),
        'handssimulated': parseInt(that.get('handsSimulated'), 10)});

    },
  }
});


