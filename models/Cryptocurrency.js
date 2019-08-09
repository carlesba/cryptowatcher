const { Schema, model } = require('mongoose')

const CryptocurrencySchema = new Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  coinMarketCapId: { type: Number, required: true }
})

CryptocurrencySchema.virtual('information').get(function() {
  return {
    symbol: this.symbol,
    name: this.name
  }
})

const Cryptocurrency = model('Cryptocurrency', CryptocurrencySchema)

module.exports = Cryptocurrency
