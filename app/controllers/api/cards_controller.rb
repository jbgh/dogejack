class Api::CardsController < ApplicationController
  def index
    @cards = Card.all
    if @cards
      render status: 200, json: @cards
    else
      render status: 500
    end
  end
end
