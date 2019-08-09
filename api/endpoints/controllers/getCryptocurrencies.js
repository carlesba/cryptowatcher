const _ = require('lodash')
const Cryptocurrency = require('@models/Cryptocurrency')
const logger = require('@config/logger')

module.exports = function getCryptocurrencies(request, response) {
  logger.debug('[getCryptocurrencies] Request')
  Cryptocurrency.find({}, { _id: 0, __v: 0 }, (error, cryptos) => {
    if (error) {
      response.status(500).send({
        status: { code: 500 }
      })
    } else if (cryptos.length === 0) {
      response.status(200).send({
        status: {
          code: 200,
          message: 'Subscribe to cryptocurrencies with /POST'
        },
        data: []
      })
    } else {
      const data = cryptos.map(crypto => {
        return _.omit(crypto.toJSON(), ['coinMarketCapId', 'marketQuotes'])
      })
      response.status(200).send({
        status: { code: 200 },
        data
      })
    }
  })
}
