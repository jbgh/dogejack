class CardSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :value, :suit
end
