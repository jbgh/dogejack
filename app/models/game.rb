class Game < ActiveRecord::Base
  belongs_to :user, counter_cache: true
  belongs_to :game_session
  validates_numericality_of :bet, greater_than: 0, only_integer: true, if: :game_started

  state_machine :state, initial: :started do 
    event :finish do
      transition all => :finished
    end
    event :dealt do
      transition :started => :players_turn
    end
    event :end_turn do
      transition :players_turn => :dealers_turn
    end
    before_transition all => :finished do |game, transition|
      game.get_winner
    end
  end

  def shuffle_time
    game_session.penetration_level < 0.33333
  end

  def deal
    2.times {get_card('player')}
    get_card('dealer')
  end

  def player_score
    get_score(player_cards)
  end

  def dealer_score
    get_score(dealer_cards)
  end

  def hit
    if state == 'players_turn'
      get_card('player')
      self.finish if bust(player_score)
      return true
    else
      false
    end
  end

  def stand
    self.end_turn if can_stand?
  end

  def dealers_turn
    if state == 'dealers_turn'
      get_card('dealer')
      self.finish if bust(dealer_score) || dealer_stand
      return true
    end
  end

  def get_winner
    if bust(player_score)
      self.winner = 'dealer'
    elsif bust(dealer_score)
      self.winner = 'player'
    elsif player_score > dealer_score
      self.winner = 'player'
    elsif dealer_score > player_score
      self.winner = 'dealer'
    else
      self.winner = 'tie'
    end
    self.save!
    update_wallet
  end

  private

  def dealer_won
    dealer_score > player_score
  end

  def update_wallet
    wallet = user.wallets.take
    case winner
      when 'player' then wallet.update_attributes(balance: wallet.balance += (bet * 2))
      when 'tie' then wallet.update_attributes(balance: wallet.balance += bet)
    end
  end

  def get_score(hand)
    hand_score = 0
    hand = hand.map{|x| Card.find(x.to_i).value}.map do |x|
      case x
      when "2".."10"  then x.to_i
      when "A" then 11
      else 10
      end
    end
    hand.sort!
    hand.each do |card|
      if card == 11 && (hand_score + card) > 21 then
        hand_score += 1
      else 
        hand_score += card
      end
    end
    hand_score
  end

  def bust(score)
    score > 21
  end

  def dealer_stand
    dealer_score >= 17
  end

  def can_hit?
    state == 'players_turn' && not_bust
  end

  def not_bust
    get_score(player_cards) <= 21
  end

  def can_stand?
    state == 'players_turn' && not_bust
  end

  def get_card(player)
    card = game_session.play_card
    if player == 'player'
      player_cards_will_change!
      update_attributes(player_cards: player_cards.push(card.id))
    elsif player == 'dealer'
      dealer_cards_will_change!
      update_attributes(dealer_cards: dealer_cards.push(card.id))
    end
  end

  def game_started
    state == 'players_turn'
  end

end
