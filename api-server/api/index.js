const express = require('express')
const expressWs = require('express-ws')
const bodyParser = require('body-parser')
const getCryptocurrencies = require('./endpoints/controllers/getCryptocurrencies')
const postCryptocurrency = require('./endpoints/controllers/postCryptocurrency')
const getCryptocurrency = require('./endpoints/controllers/getCryptocurrency')
const deleteCryptocurrency = require('./endpoints/controllers/deleteCryptocurrency')
const getCryptocurrencyLatest = require('./endpoints/controllers/getCryptocurrencyLatest')
const getCryptocurrencyHistory = require('./endpoints/controllers/getCryptocurrencyHistory')
const wsConnectionHandler = require('./websocket/wsConnectionHandler')
const Redis = require('@infrastructure/redis')
const logger = require('@config/logger')

const { API_PORT } = process.env

module.exports = function startServer(bus) {
  const app = express()
  // Add websocket to express
  expressWs(app)
  const router = express.Router()
  const jsonParser = bodyParser.json()
  const middlewareCache = Redis.getMiddleware()

  return new Promise(function(resolve) {
    if (!bus) {
      throw new Error(`Bus is missing. It's required to start websocket server`)
    }
    app.disable('x-powered-by')
    router.get('/cryptocurrencies', getCryptocurrencies)
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

    app.use(corsMiddleware)
    app.ws('/live', function(ws) {
      logger.silly(`[api] New websocket connection`)
      wsConnectionHandler(bus, ws)
    })
    app.use('/api', router)

    app.listen(API_PORT, () => {
      logger.info(`[api] Express server started on port ${API_PORT}`)
      resolve(app)
    })
  })
}

function corsMiddleware(request, response, next) {
  response.header('Access-Control-Allow-Origin', '*')
  response.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
}
