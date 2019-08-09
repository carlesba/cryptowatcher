const moment = require('moment')
const MarketQuote = require('@models/MarketQuote')
const Cryptocurrency = require('@models/Cryptocurrency')
const logger = require('@config/logger')

const HISTORY_LIMIT_MINUTES = 100

module.exports = function getCryptocurrencyHistory(request, response) {
  const { symbol } = request.params
  logger.debug('[getCryptocurrencyHistory] symbol: ' + symbol)

  Cryptocurrency.findOne({ symbol }, (error, crypto) => {
    if (error) {
      response.status(500).send({
        status: { code: 500 }
      })
      logger.error('[getCryptocurrencyHistory] 500 ' + error.message)
      return
    }
    if (!crypto) {
      response.status(404).send({
        status: {
          code: 404,
          message: `Cannot find ${symbol}. May need subscription.`
        }
      })
      logger.warn('[getCryptocurrencyHistory] 404 ' + symbol)
      return
    }

    const historyEdgeTimestamp = moment()
      .subtract(HISTORY_LIMIT_MINUTES, 'minute')
      .toISOString()
    const query = { symbol, timestamp: { $gte: historyEdgeTimestamp } }
    MarketQuote.find(query, (error, mqs) => {
      if (error) {
        response.status(500).send({
          status: { code: 500 }
        })
        logger.error('[getCryptocurrencyHistory] 500 ' + error.message)
      } else {
        const marketQuotes = mqs.map(mq => mq.withoutSymbol)
        response.status(200).send({
          status: { code: 200 },
          data: marketQuotes
        })
        logger.debug('[getCryptocurrencyHistory] 200 ' + symbol)
      }
    })
  })
}
