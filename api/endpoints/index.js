const express = require('express')
const bodyParser = require('body-parser')
const getCryptocurrencies = require('./controllers/getCryptocurrencies')
const postCryptocurrency = require('./controllers/postCryptocurrency')
const getCryptocurrency = require('./controllers/getCryptocurrency')
const deleteCryptocurrency = require('./controllers/deleteCryptocurrency')
const getCryptocurrencyLatest = require('./controllers/getCryptocurrencyLatest')
const getCryptocurrencyHistory = require('./controllers/getCryptocurrencyHistory')
const Redis = require('@infrastructure/redis')
const logger = require('@config/logger')

module.exports = function startServer() {
  const app = express()
  const router = express.Router()
  const jsonParser = bodyParser.json()
  const middlewareCache = Redis.getMiddleware()

  return new Promise(function(resolve) {
    router.get(
      '/cryptocurrencies',
      middlewareCache('60 seconds'),
      getCryptocurrencies
    )
    router.post('/cryptocurrencies', jsonParser, postCryptocurrency)
    router.get(
      '/cryptocurrencies/:symbol',
      middlewareCache('60 seconds'),
      getCryptocurrency
    )
    router.delete('/cryptocurrencies/:symbol', deleteCryptocurrency)
    router.get(
      '/cryptocurrencies/:symbol/latest',
      middlewareCache('60 seconds'),
      getCryptocurrencyLatest
    )
    router.get(
      '/cryptocurrencies/:symbol/history',
      middlewareCache('60 seconds'),
      getCryptocurrencyHistory
    )
    app.use('/api', router)

    app.listen(process.env.EXPRESS_PORT, () => {
      logger.info(
        `[endpoints] Express server started on port ${process.env.EXPRESS_PORT}`
      )
      resolve(app)
    })
  })
}
