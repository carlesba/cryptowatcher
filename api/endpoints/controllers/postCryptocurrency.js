const Cryptocurrency = require('@models/Cryptocurrency')
const InformationProvider = require('@services/coinMarketCap/InformationProvider')
const logger = require('@config/logger')

module.exports = function postCryptocurrency(request, response) {
  const { symbol } = request.body

  logger.debug('[postCryptocurrency] symbol: ' + symbol)
  Cryptocurrency.exists({ symbol }, function(error, exists) {
    if (error) {
      response.status(500).send({
        status: { code: 500, message: 'Internal error' }
      })
      logger.error('[postCryptocurrency] 500' + error.message)
      return
    }
    if (exists) {
      response.status(304).send({ status: { code: 304 } })
      logger.info('[postCryptocurrency] 304 ' + symbol)
      return
    }
    InformationProvider.fetch(symbol, function(fetchError, information) {
      if (fetchError) {
        handleFetchError(fetchError, response)
      } else {
        const { symbol, id, name } = information
        Cryptocurrency.create({ symbol, coinMarketCapId: id, name }, function(
          error
        ) {
          handleCryptocurrencyCreate(error, symbol, response)
        })
      }
    })
  })
}

function handleCryptocurrencyCreate(error, symbol, response) {
  if (error) {
    response.status(500).send({
      status: {
        code: 500,
        message: 'Cannot store subscription'
      }
    })
    logger.error('[postCryptocurrency] 500 ' + error.message)
  } else {
    response.status(200).send({
      status: { code: 200 }
    })
    logger.info('[postCryptocurrency] 200 ' + symbol)
  }
}

function handleFetchError(error, response) {
  switch (error.message) {
    case InformationProvider.ERRORS.INVALID_SYMBOL:
      response.status(400).send({
        status: { code: 400, message: 'Invalid symbol' }
      })
      logger.info('[postCryptocurrency] 400 ' + error.message)
      break
    case InformationProvider.ERRORS.COINMARKETCAP_ERROR:
    case InformationProvider.ERRORS.FETCHID_ERROR:
    default:
      response.status(500).send({
        status: { code: 500, message: 'Internal error' }
      })
      logger.error('[postCryptocurrency] 500' + error.message)
  }
}
