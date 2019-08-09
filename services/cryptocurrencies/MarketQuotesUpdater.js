const _ = require('lodash')
const Cryptocurrency = require('@models/Cryptocurrency')
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
      updateMarketQuotes(marketQuotes, error => {
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

function updateMarketQuotes(marketQuotes, callback) {
  const updatePromises = Object.keys(marketQuotes).map(id => {
    return new Promise(function(resolve) {
      updateMarketQuote(id, marketQuotes[id], updateQuoteError => {
        resolve(updateQuoteError)
      })
    })
  })
  Promise.all(updatePromises).then(errors => {
    const errorsCount = _.compact(errors).length
    if (errorsCount === 0) {
      callback(null)
    } else {
      callback(ERRORS.UNEXPECTED)
    }
  })
}

function updateMarketQuote(id, marketQuote, callback) {
  Cryptocurrency.updateOne(
    { coinMarketCapId: +id },
    { $push: { marketQuotes: marketQuote } },
    function(error) {
      if (error) {
        callback(ERRORS.UNEXPECTED)
      } else {
        callback(null, marketQuote)
      }
    }
  )
}

module.exports = {
  ERRORS,
  update
}
