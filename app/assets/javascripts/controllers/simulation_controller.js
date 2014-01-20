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
      that.toggleProperty('simulating');

      var bet = parseInt(that.get('baseBet'), 10);
      var currentShoe = shuffle(that.get('shoe'));
      var usedCards = [];
      var playerHand = [];
      var dealerHand = [];
      var bankroll = parseInt(that.get('startingBankroll'), 10);
      var bankrollHistory = [];
      var currentBet = 0;
      var splitCounter = [];
      var doubleCounter = [];
      var trueCountHistory = [];
      var betHistory = [];
      var highCards = [];
      var lowCards = [];
      // var playerHandHistory = [];
      // var dealerHandHistory = [];

      function deal(shoe){
        var card = shoe.pop();
        usedCards.push(card);
        if (card === 10 || card === 'A'){
          highCards.push(card);
        } else if (card < 7){
          lowCards.push(card);
        }
        return card;
      }

      function shuffle(shoe){
        return _.shuffle(shoe);
      }

      function getTrueCount(shoe, discard){
        var fullShoeLength = shoe.length + discard.length;
        var penetrationLevel = shoe.length / fullShoeLength;
        var runningCount = lowCards.length - highCards.length;

        return runningCount / (penetrationLevel * (fullShoeLength / 52));
      }

      // Math

      function sumArray(array){
        var sum = 0;
        for (m=0,len = array.length; m < len; m++){
          sum += array[m];
        }
        return sum;
      }

      function average(array){
        return sumArray(array)/array.length;
      }

      function betterContains(array, value){
        var containsTest = false;
        for (n=0,lenTwo = array.length; n < lenTwo; n++){
          if (array[n] === value){
            containsTest = true;
          }
        }

        if(containsTest === true){
          return true;
        } else {
          return false;
        }
      }

      function calcScore(hand){
        if (betterContains(hand, 'A')){
          var numOfAce = _.filter(hand, function(card){ return card === 'A'; }).length;
          var handWithoutAce = _.filter(hand, function(card){ return card !== 'A'; });
          if ((sumArray(handWithoutAce) + numOfAce) < 12){
            return sumArray(handWithoutAce) + 11 + (numOfAce - 1);
          } else {
            return sumArray(handWithoutAce) + numOfAce;
          }
        } else {
          return sumArray(hand);
        }
      }

      function softHand(hand){
        if (betterContains(hand, 'A')){
          var numOfAce = _.filter(hand, function(card){ return card === 'A'; }).length;
          var handWithoutAce = _.filter(hand, function(card){ return card !== 'A'; });
          if ((sumArray(handWithoutAce) + numOfAce) < 12){
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }

      function blackJack(hand){
        if (betterContains(hand, 'A') && betterContains(hand, 10) && hand.length === 2){
          return true;
        } else {
          return false;
        }
      }

      // Split related functions

      function split(playerHand){
        var splitup = _.map(playerHand, function(card){ return [card]; });
        splitup.forEach(function(hand){ hand.push(deal(currentShoe)); });
        return splitup;
      }

      function resplit(playerHand, loopNumber){
        split(playerHand[loopNumber]).forEach(function(hand){ playerHand.push(hand); });
      }

      function deleteResplits(splitCounter, playerHand){
        splitCounter.forEach(function(index){ playerHand.splice(index, 1); });
      }

      // Basic strategy chart behaviour for following rules:
      // 6 deck shoe
      // BJ 3:2
      // Dealer stands on soft 17
      // Double after split allowed
      // Late surrender allowed
      // Resplit aces allowed

      function basicStrategy(playerHand, dealerHand){
        var holeCard = dealerHand[0];

        if (blackJack(playerHand) && blackJack(dealerHand) === false){
          return 'player blackjack';
        }

        if (blackJack(dealerHand) && blackJack(playerHand) === false){
          return 'dealer blackjack';
        }

        if (blackJack(dealerHand) && blackJack(playerHand)){
          return 'blackjack push';
        }

        if (calcScore(playerHand) > 21){
          return 'bust';
        }

        // Pair Hands

        if (playerHand[0] === playerHand[1]){
          if (playerHand[0] === 'A' && playerHand[1] === 'A'){
            return 'split';
          }
          switch (calcScore(playerHand)){
            case 4:
              if (holeCard < 8){
                return 'split';
              } else {
                return 'hit';
              }
            case 6:
              if (holeCard < 8){
                return 'split';
              } else {
                return 'hit';
              }
            case 8:
              if (holeCard !== 5 || holeCard !== 6){
                return 'hit';
              } else {
                return 'split';
              }
            case 10:
              if (holeCard < 10){
                return 'double';
              } else {
                return 'hit';
              }
            case 12:
              if (holeCard < 7){
                return 'split';
              } else {
                return 'hit';
              }
            case 14:
              if (holeCard < 8){
                return 'split';
              } else {
                return 'hit';
              }
            case 16:
              return 'split';
            case 18:
              if (holeCard === 7 || holeCard === 10 || holeCard === 'A'){
                return 'stand';
              } else {
                return 'split';
              }
            case 20:
              return 'stand';
          }
        }

        // Soft Hands

        if (softHand(playerHand) && blackJack(playerHand) === false && blackJack(dealerHand) === false){
          switch(calcScore(playerHand)){
            case 13:
              if (holeCard === 5 || holeCard === 6){
                if (playerHand.length === 2){
                  return 'double';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 14:
              if (holeCard === 5 || holeCard === 6){
                if (playerHand.length === 2){
                  return 'double';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 15:
              if (holeCard > 3 && holeCard < 7){
                if (playerHand.length === 2){
                  return 'double';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 16:
              if (holeCard > 3 && holeCard < 7){
                if (playerHand.length === 2){
                  return 'double';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 17:
              if (holeCard > 2 && holeCard < 7){
                if (playerHand.length === 2){
                  return 'double';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 18:
              if (holeCard > 2 && holeCard < 7){
                if (playerHand.length === 2){
                  return 'double';
                } else {
                  return 'stand';
                }
              } else if (holeCard === 2 || holeCard === 7 || holeCard === 8){
                return 'stand';
              } else {
                return 'hit';
              }
            case 19:
              return 'stand';
            case 20:
              return 'stand';
            case 21:
              return 'stand';
          }
        } else if (blackJack(playerHand) === false && blackJack(dealerHand) === false) {

          // Hard Hands

          switch(calcScore(playerHand)){
            case 5:
              return 'hit';
            case 6:
              return 'hit';
            case 7:
              return 'hit';
            case 8:
              return 'hit';
            case 9:
              if (holeCard > 2 && holeCard < 7){
                if (playerHand.length === 2){
                  return 'double';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 10:
              if (holeCard !== 10 || holeCard !== 'A'){
                if (playerHand.length === 2){
                  return 'double';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 11:
              if (holeCard !== 'A'){
                if (playerHand.length === 2){
                  return 'double';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 12:
              if (holeCard > 3 && holeCard < 7){
                return 'stand';
              } else {
                return 'hit';
              }
            case 13:
              if (holeCard < 7){
                return 'stand';
              } else {
                return 'hit';
              }
            case 14:
              if (holeCard < 7){
                return 'stand';
              } else {
                return 'hit';
              }
            case 15:
              if (holeCard < 7){
                return 'stand';
              } else if (holeCard === 10) {
                if (playerHand.length === 2) {
                  return 'surrender';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 16:
              if (holeCard < 7){
                return 'stand';
              } else if (holeCard === 9 || holeCard === 10 || holeCard === 'A') {
                if (playerHand.length === 2) {
                  return 'surrender';
                }
                return 'hit';
              } else {
                return 'hit';
              }
            case 17:
              return 'stand';
            case 18:
              return 'stand';
            case 19:
              return 'stand';
            case 20:
              return 'stand';
            case 21:
              return 'stand';
          }
        }
      }

      function playerStands(){

        // Dealer hits until 17+ and stands on soft 17
        while (calcScore(dealerHand) < 17){
          dealerHand.push(deal(currentShoe));
        }

        // Dealer busts

        if (calcScore(dealerHand) > 21){
          bankroll = bankroll + (currentBet * 2);
          bankrollHistory[i] = bankroll;

        // Player wins

        } else if (calcScore(playerHand) > calcScore(dealerHand)){
          bankroll = bankroll + (currentBet * 2);
          bankrollHistory[i] = bankroll;

        // Dealer wins

        } else if (calcScore(playerHand) < calcScore(dealerHand)){
          bankrollHistory[i] = bankroll;

        // Push

        } else if (calcScore(playerHand) === calcScore(dealerHand)){
          bankrollHistory[i] = bankroll + currentBet;
        }
      }

      for(var i=0; i < parseInt(that.get('handsSimulated'), 10); i++){

        // Calculate true count before start of hand

        var trueCount = Math.round(getTrueCount(currentShoe, usedCards));
        trueCountHistory.push(trueCount);

        if (i !== 0){
          bankroll = bankrollHistory[i-1];
        }

        // Bet raised based on true count

        if (trueCount > 1){
          currentBet = bet * trueCount;
          bankroll = bankroll - currentBet;
        } else {
          currentBet = parseInt(that.get('tableMin'), 10);
          bankroll = bankroll - currentBet;
        }

        // Deal out the hands, assumes playing heads up against dealer

        for (var j = 0; j < 2; j++) {
          playerHand.push(deal(currentShoe));
          dealerHand.push(deal(currentShoe));
        }

        // Player BlackJack

        if (basicStrategy(playerHand, dealerHand) === 'player blackjack'){
          bankroll = bankroll + (currentBet * 2.5);
          bankrollHistory[i] = bankroll;
        }
        // Dealer BlackJack

        if (basicStrategy(playerHand, dealerHand) === 'dealer blackjack'){
          bankrollHistory[i] = bankroll;
        }

        // BlackJack Push

        if (basicStrategy(playerHand, dealerHand) === 'blackjack push'){
          bankrollHistory[i] = bankroll + currentBet;
        }

        // Surrender

        if (basicStrategy(playerHand, dealerHand) === 'surrender'){
          bankroll = bankroll + (currentBet * 0.5);
          bankrollHistory[i] = bankroll;
        }

        // Stand

        if (basicStrategy(playerHand, dealerHand) === 'stand'){
          
          playerStands();

        // Double

        } else if (basicStrategy(playerHand, dealerHand) === 'double'){
          bankroll = bankroll - currentBet;
          currentBet = currentBet * 2;

          playerHand.push(deal(currentShoe));

          playerStands();

        // Hit

        } else if (basicStrategy(playerHand, dealerHand) === 'hit'){

          do {
            playerHand.push(deal(currentShoe));
          } while (basicStrategy(playerHand, dealerHand) === 'hit');

          if (basicStrategy(playerHand, dealerHand) === 'bust'){
            bankrollHistory[i] = bankroll;
          } else {
            playerStands();
          }

        // Split

        } else if (basicStrategy(playerHand, dealerHand) === 'split'){

          playerHand = split(playerHand);
          // Go through and resplit as many times as possible
          splitCounter.length = 0;
          for(var k=0; k < playerHand.length; k++){
            if (basicStrategy(playerHand[k], dealerHand) === 'split'){
              resplit(playerHand, k);
              splitCounter.push(k);
            }
          }

          // Delete original hands
          deleteResplits(splitCounter, playerHand);
          // Play through each split hand
          // Push hand indexes where doubled
          doubleCounter.length = 0;
          for(var l=0; l < playerHand.length; l++){
            if (basicStrategy(playerHand[l], dealerHand) === 'double'){
              playerHand[l].push(deal(currentShoe));
              doubleCounter.push(l);
            } else if (basicStrategy(playerHand[l], dealerHand) === 'hit'){
              do {
                playerHand[l].push(deal(currentShoe));
              } while (basicStrategy(playerHand[l], dealerHand) === 'hit');
            }
          }
          // Add initial bet back to bankroll to make calculations easier
          bankroll = bankroll + currentBet;
          // Deal out the dealers cards
          while (calcScore(dealerHand) < 17){
            dealerHand.push(deal(currentShoe));
          }

          // If dealer busted payout all the hands
          if (calcScore(dealerHand) > 21){
            bankroll = bankroll + ((currentBet * playerHand.length) + (currentBet * (doubleCounter.length + 1)));
          }
          // If not then check to see which hands won and pay those out
          for(var p=0; p < playerHand.length; p++){
            if (calcScore(playerHand[p]) > calcScore(dealerHand) && basicStrategy(playerHand, dealerHand) !== 'bust'){
              if (betterContains(doubleCounter, p)){
                bankroll = bankroll + (currentBet * 2);
              } else {
                bankroll = bankroll + currentBet;
              }
              
            } else if (calcScore(playerHand[p]) < calcScore(dealerHand) || basicStrategy(playerHand, dealerHand) === 'bust'){
              bankroll = bankroll - currentBet;
            }
          }
          // Record Bankroll for split hands
          bankrollHistory[i] = bankroll;

        }

        // Hand History
        // playerHandHistory.push(playerHand.slice(0));
        // dealerHandHistory.push(dealerHand.slice(0));

        // Bet History
        betHistory.push(currentBet);

        // Clear out the hands
        playerHand.length = 0;
        dealerHand.length = 0;

        //Reshuffle if necessary 
        if ((usedCards.length / that.get('shoe').length) > 0.75){
          currentShoe = shuffle(that.get('shoe'));
          usedCards.length = 0;
          highCards.length = 0;
          lowCards.length = 0;
        }
      }

      that.set('averageBet', average(betHistory));
      that.set('maxBet', _.max(betHistory));
      that.set('lowBankroll', _.min(Object.keys(bankrollHistory).map(function(v) { return bankrollHistory[v]; })));
      that.set('highBankroll', _.max(Object.keys(bankrollHistory).map(function(v) { return bankrollHistory[v]; })));
      that.set('endingBankroll', bankroll);

      that.toggleProperty('simulating');

    }
  }
});

