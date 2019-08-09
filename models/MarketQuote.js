const { Schema, model } = require('mongoose')

const MarketQuoteSchema = new Schema({
  symbol: { type: String, require: true },
  price: { type: Number, required: true },
  currency: { type: String, required: true },
  timestamp: { type: String, required: true }
})

MarketQuoteSchema.virtual('withoutSymbol').get(function() {
  return {
    price: this.price,
    currency: this.currency,
    timestamp: this.timestamp
  }
})

const MarketQuote = model('MarketQuote', MarketQuoteSchema)

module.exports = MarketQuote
