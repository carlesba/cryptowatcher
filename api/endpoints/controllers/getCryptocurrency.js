const _ = require('lodash')
const Cryptocurrency = require('@models/Cryptocurrency')
const logger = require('@config/logger')

module.exports = function getCryptocurrency(request, response) {
  const { symbol } = request.params
  logger.debug('[getCryptocurrency] symbol: ' + symbol)
  Cryptocurrency.findOne({ symbol }, { __v: 0, _id: 0 }, (error, crypto) => {
    if (error) {
      response.status(500).send({
        status: { code: 500 }
      })
      logger.error('[getCryptocurrency] 500' + error.message)
    } else if (!crypto) {
      response.status(404).send({
        status: { code: 404 }
      })
      logger.warn('[getCryptocurrency] 404 ' + symbol)
    } else {
      const data = crypto.information

      response.status(200).send({
        status: { code: 200 },
        data
      })
      logger.debug('[getCryptocurrency] 200 ', data)
    }
  })
}
