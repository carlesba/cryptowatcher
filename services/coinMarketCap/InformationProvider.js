const axios = require('axios')
const _ = require('lodash')
const logger = require('@config/logger')

const INVALID_SYMBOL = 'Invalid symbol'
const COINMARKETCAP_ERROR = 'CoinMarketCap error'
const FETCHID_ERROR = 'Error'

const ERRORS = {
  INVALID_SYMBOL,
  COINMARKETCAP_ERROR,
  FETCHID_ERROR
}

function fetch(symbol, callback) {
  const config = {
    url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map',
    params: { symbol },
    headers: { 'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_APIKEY },
    responseType: 'json'
  }

  logger.info('[InformationProvider] request:' + symbol)

  axios(config)
    .then(response => {
      const information = _.chain(response)
        .get('data.data[0]')
        .pick(['id', 'name', 'symbol'])
        .value()

      logger.debug('[InformationProvider] success:' + information.name)
      callback(null, information)
    })
    .catch(error => {
      const code = _.get(error, 'response.data.status.error_code')

      if (code === 400) {
        logger.warn(
          `[InformationProvider] CoinMarketCap: Invalid symbol ${symbol}`
        )
        callback(new Error(INVALID_SYMBOL))
      } else if (code > 400) {
        logger.error('[InformationProvider] CoinMarketCap error')
        callback(Error(COINMARKETCAP_ERROR))
      } else {
        logger.error('[InformationProvider] failed : ' + error.message)
        callback(Error(FETCHID_ERROR))
      }
    })
}

module.exports = {
  ERRORS,
  fetch
}
