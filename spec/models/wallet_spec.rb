require 'spec_helper'

describe Wallet do
  it {should belong_to(:user)}
  it {should validate_uniqueness_of(:user_id)}
  it {should validate_presence_of(:user_id)}
  it {should validate_presence_of(:balance)}
end
