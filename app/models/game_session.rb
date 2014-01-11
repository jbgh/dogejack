class GameSession < ActiveRecord::Base
  has_many :games 
  has_many :decks
  has_many :cards, through: :decks
  belongs_to :user

  after_create :create_decks

  NUMBER_OF_DECKS = 6

  def number_of_decks
    NUMBER_OF_DECKS
  end

  def create_decks
    NUMBER_OF_DECKS.times do
      Deck.create!(game_session_id: id)
    end
  end

  def play_card
    card = decks.map { |deck| deck.deck_cards.where(played: false) }.flatten.sample
    card.played = true
    card.save!
    card.card
  end

  def played_cards
    cards.references(:deck_cards).where(deck_cards: {played: true}).pluck(:value)
  end

  def penetration_level
    played_cards = 0
    decks.each do |deck|
      played_cards += deck.played_cards.count
    end
    1 - (played_cards / (decks.count * Card.count.to_f))
  end

end
