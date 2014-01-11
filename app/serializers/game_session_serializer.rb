class GameSessionSerializer < ActiveModel::Serializer
  attributes :id, :played_cards, :number_of_decks, :penetration_level
end
