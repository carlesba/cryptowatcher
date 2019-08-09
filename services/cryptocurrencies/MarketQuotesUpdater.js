const Cryptocurrency = require('@models/Cryptocurrency')
const MarketQuote = require('@models/MarketQuote')
const MarketQuotesProvider = require('@services/coinMarketCap/MarketQuotesProvider')
const logger = require('@config/logger')

const ERRORS = {
  UNEXPECTED: 'Unexpected Error',
  DATABASE_CORRUPTED: 'Some store data is wrong in the database',
  EXTERNAL_SERVICE: 'There was an issue with CoinMarketCap'
}

function update(callback) {
  Cryptocurrency.find({}, (findError, cryptos) => {
    if (findError) {
      logger.debug(
        '[MarketQuotesUpdater] Error finding cryptocurrencies ',
        findError.message
      )
      callback(new Error(ERRORS.UNEXPECTED))
      return
    }

    if (!cryptos.length) {
      logger.debug('[MarketQuotesUpdater] Nothing to update')
      callback(null)
      return
    }
    const ids = cryptos.map(c => c.coinMarketCapId)
    MarketQuotesProvider.fetch(ids, function(fetchError, marketQuotes) {
      if (fetchError) {
        switch (fetchError.message) {
          case MarketQuotesProvider.ERRORS.INVALID_ID:
            callback(new Error(ERRORS.DATABASE_CORRUPTED))
            break
          case MarketQuotesProvider.ERRORS.COINMARKETCAP_ERROR:
            callback(new Error(ERRORS.EXTERNAL_SERVICE))
            break
          default:
            callback(new Error(ERRORS.UNEXPECTED))
        }
        logger.debug(
          '[MarketQuotesUpdater] Error fetching marketQuotes ',
          fetchError.message
        )
        return
      }

      MarketQuote.insertMany(marketQuotes, error => {
        if (error) {
          callback(new Error(ERRORS.UNEXPECTED))
          logger.debug(
            '[MarketQuotesUpdater] Updating MarketQuotes ',
            error.message
          )
        } else {
          logger.debug('[MarketQuotesUpdater] MarketQuotes Updated')
          callback(null)
        }
      })
    })
  })
}

module.exports = {
  ERRORS,
  update
}
