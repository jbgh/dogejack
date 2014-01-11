class Api::GamesController < ApplicationController
  before_action :get_user
  before_action :get_game
  before_action :get_game_session
  before_action :verify_user_token
  before_action :get_wallet, only: [:deal]

  def create
    @game ||= Game.create!(user: @user, game_session: @session)
    if @game.shuffle_time
      @game_session = GameSession.create(user: @user)
      @game.update_attributes(game_session_id: @game_session.id)
    end
    if @game
      render status: 200, json: [@game]
    else
      render status: 500
    end
  end

  def deal
    @game.deal
    @game.bet = params[:betAmount].to_i if params[:betAmount]
    @game.dealt
    @wallet.update_attributes(balance: (@wallet.balance -= @game.bet))
    render status: 200, json: [@game]
  end

  def hit
    if @game.hit
      render status: 200, json: [@game]
    else
      render status: 500, json: errors
    end
  end

  def stand
    if @game.stand
      render status: 200, json: [@game]
    else
      render status: 500, json: errors
    end
  end

  def dealer
    @game.dealers_turn
    render status: 200, json: [@game]
  end

  private

  def verify_user_token
     @user == current_user
  end

  def get_user
    @user = User.find_by_authentication_token(request.authorization.split(' ')[1])
  end

  def get_game
    @game = @user.unfinished_games.take
  end

  def get_game_session
    @session = @user.game_sessions.last || GameSession.create!(user_id: @user.id)
  end

  def get_wallet
    if @user
      @wallet = @user.wallets.take
    end
  end
end
