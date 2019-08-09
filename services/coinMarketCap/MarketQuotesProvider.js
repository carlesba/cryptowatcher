const axios = require('axios')
const _ = require('lodash')
const logger = require('@config/logger')

const REFERENCE_CURRENCY = 'EUR'

const ERRORS = {
  INVALID_ID: 'CoinMarketCap: Invalid value id',
  COINMARKETCAP_ERROR: 'CoinMarketCap error',
  UNEXPECTED: 'Unexpected error'
}

function fetchMarketQuotes(ids, callback) {
  const config = {
    method: 'GET',
    url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
    params: { id: ids.join(','), convert: REFERENCE_CURRENCY },
    headers: {
      'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_APIKEY
    },
    responseType: 'json'
  }

  logger.info(
    '[MarketQuotesProvider] request for ids: [' + ids.join(', ') + ']'
  )
  return axios(config)
    .then(response => {
      const serverData = response.data.data
      const marketQuotes = Object.keys(serverData).map(key => {
        const value = serverData[key]
        return {
          symbol: value.symbol,
          price: value.quote[REFERENCE_CURRENCY].price,
          currency: REFERENCE_CURRENCY,
          timestamp: value.quote[REFERENCE_CURRENCY].last_updated
        }
      })
      callback(null, marketQuotes)
    })
    .catch(error => {
      const code = _.get(error, 'response.data.status.error_code')
      const message = _.get(error, 'response.data.status.error_message')
      logger.error(`[MarketQuotesProvider] coinMarketCap: ${code} ${message}`)
      logger.error('[MarketQuotesProvider] ' + error.message)
      if (code === 400) {
        callback(new Error(ERRORS.INVALID_ID))
      } else if (code > 300) {
        callback(new Error(ERRORS.COINMARKETCAP_ERROR))
      } else {
        callback(new Error(ERRORS.UNEXPECTED))
      }
    })
}

module.exports = {
  ERRORS,
  fetch: fetchMarketQuotes
}
