const _ = require('lodash')
const getCryptocurrencyLatest = require('./getCryptocurrencyLatest')
const {
  connectMockedDatabase,
  disconnectMockedDatabase
} = require('@config/tests')
const createResponseSpy = require('./utils/createResponseSpy')
const Cryptocurrency = require('@models/Cryptocurrency')
const MarketQuote = require('@models/MarketQuote')

beforeAll(connectMockedDatabase)
afterAll(disconnectMockedDatabase)

test(`Requested symbol is not in the system`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  getCryptocurrencyLatest(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 404, message: 'Cannot find BTC. May need subscription.' }
  })
  expect(statusSpy).toHaveBeenCalledWith(404)
  done()
})

test(`Requested symbol is in the system without quotes`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  const crypto = { symbol: 'BTC', coinMarketCapId: 1, name: 'Bitcoin' }
  await Cryptocurrency.create(crypto)

  getCryptocurrencyLatest(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 404, message: 'No market quotes yet for ETH' }
  })
  expect(statusSpy).toHaveBeenCalledWith(404)
  done()
})

test(`Get latest successfully`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  const marketQuotes = [
    {
      symbol: 'BTC',
      price: 10200,
      currency: 'EUR',
      timestamp: '2019-08-08T07:14:39.090Z'
    },
    {
      symbol: 'BTC',
      price: 10100,
      currency: 'EUR',
      timestamp: '2019-08-08T07:34:39.090Z'
    },
    {
      symbol: 'BTC',
      price: 10300,
      currency: 'EUR',
      timestamp: '2019-08-08T07:54:39.090Z'
    }
  ]
  await MarketQuote.insertMany(marketQuotes)

  getCryptocurrencyLatest(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200 },
    data: _.omit(marketQuotes[2], ['symbol'])
  })
  expect(statusSpy).toHaveBeenCalledWith(200)

  done()
})
