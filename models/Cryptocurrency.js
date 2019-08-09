const { Schema, model } = require('mongoose')

const CryptocurrencySchema = new Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  coinMarketCapId: { type: Number, required: true },
  marketQuotes: [
    {
      price: { type: Number, required: true },
      currency: { type: String, required: true },
      timestamp: { type: String, required: true }
    }
  ]
})

const Cryptocurrency = model('Cryptocurrency', CryptocurrencySchema)

module.exports = Cryptocurrency
