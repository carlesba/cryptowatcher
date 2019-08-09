const express = require('express')
const bodyParser = require('body-parser')
const getCryptocurrencies = require('./controllers/getCryptocurrencies')
const postCryptocurrency = require('./controllers/postCryptocurrency')
const getCryptocurrency = require('./controllers/getCryptocurrency')
const deleteCryptocurrency = require('./controllers/deleteCryptocurrency')
const getCryptocurrencyLatest = require('./controllers/getCryptocurrencyLatest')
const getCryptocurrencyHistory = require('./controllers/getCryptocurrencyHistory')

const logger = require('@config/logger')

module.exports = function startServer() {
  const app = express()
  const router = express.Router()
  const jsonParser = bodyParser.json()

  return new Promise(function(resolve) {
    router.get('/cryptocurrencies', getCryptocurrencies)
    router.post('/cryptocurrencies', jsonParser, postCryptocurrency)
    router.get('/cryptocurrencies/:symbol', getCryptocurrency)
    router.delete('/cryptocurrencies/:symbol', deleteCryptocurrency)
    router.get('/cryptocurrencies/:symbol/latest', getCryptocurrencyLatest)
    router.get('/cryptocurrencies/:symbol/history', getCryptocurrencyHistory)
    app.use('/api', router)

    app.listen(process.env.EXPRESS_PORT, () => {
      logger.info(
        `[endpoints] Express server started on port ${process.env.EXPRESS_PORT}`
      )
      resolve(app)
    })
  })
}
