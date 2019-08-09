const Cryptocurrency = require('@models/Cryptocurrency')
const logger = require('@config/logger')

module.exports = function postCryptocurrency(request, response) {
  const { symbol } = request.params

  logger.debug('[deleteCryptocurrency] symbol: ' + symbol)
  Cryptocurrency.findOneAndDelete({ symbol }, function(error) {
    if (error) {
      logger.error('[deleteCryptocurrency] 500 ' + error.message)
      response.status(500).send({
        status: {
          code: 500,
          message: `Couldn't unsubscribe from ${symbol}`
        }
      })
    } else {
      logger.info(`[deleteCryptocurrency] 200 unsubscribed from ${symbol}`)
      response.status(200).send({
        status: { code: 200 }
      })
    }
  })
}
