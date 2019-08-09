const _ = require('lodash')
const Cryptocurrency = require('@models/Cryptocurrency')
const logger = require('@config/logger')

module.exports = function getCryptocurrencyLatest(request, response) {
  const { symbol } = request.params
  logger.debug('[getCryptocurrencyLastest] symbol: ' + symbol)
  Cryptocurrency.findOne({ symbol }, (error, crypto) => {
    if (error) {
      response.status(500).send({
        status: { code: 500 }
      })
      logger.error('[getCryptocurrencyLastest] 500 ' + error.message)
    } else if (crypto === null || crypto.marketQuotes.length === 0) {
      const message =
        crypto === null
          ? 'Cannot find BTC. May need subscription.'
          : 'No market quotes yet for ETH'
      response.status(404).send({
        status: {
          code: 404,
          message
        }
      })
      logger.warn('[getCryptocurrencyLastest] 404: ' + message)
    } else {
      const latestMarketQuote = crypto.marketQuotes.slice(-1).pop()
      const marketQuote = _.omit(latestMarketQuote.toJSON(), ['_id'])
      response.status(200).send({
        status: { code: 200 },
        data: marketQuote
      })
      logger.debug('[getCryptocurrencyLastest] 200 ', marketQuote)
    }
  })
}
