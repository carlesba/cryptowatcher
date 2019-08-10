const _ = require('lodash')
const Cryptocurrency = require('@models/Cryptocurrency')
const MarketQuote = require('@models/MarketQuote')
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
      return
    }
    if (crypto === null) {
      const message = `Cannot find ${symbol}. May need subscription.`
      response.status(404).send({
        status: {
          code: 404,
          message
        }
      })
      logger.warn('[getCryptocurrencyLastest] 404: ' + message)
      return
    }
    MarketQuote.findOne({ symbol }, {}, { sort: { $natural: -1 } }, function(
      error,
      mq
    ) {
      if (error) {
        response.status(500).send({
          status: { code: 500 }
        })
        logger.error('[getCryptocurrencyLastest] 500 ' + error.message)
        return
      }
      if (!mq) {
        const message = 'No market quotes yet for ETH'
        response.status(404).send({
          status: {
            code: 404,
            message
          }
        })
        logger.warn('[getCryptocurrencyLastest] 404: ' + message)
        return
      }

      const marketQuote = mq.withoutSymbol
      response.status(200).send({
        status: { code: 200 },
        data: marketQuote
      })
      logger.debug('[getCryptocurrencyLastest] 200 ', marketQuote)
    })
  })
}
