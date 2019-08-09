const _ = require('lodash')
const getCryptocurrencyHistory = require('./getCryptocurrencyHistory')
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
  getCryptocurrencyHistory(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 404, message: 'Cannot find BTC. May need subscription.' }
  })
  expect(statusSpy).toHaveBeenCalledWith(404)
  done()
})
test('Symbol is in the system without market quotes', async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  const crypto = {
    symbol: 'BTC',
    name: 'Bitcoin',
    coinMarketCapId: 1
  }
  await Cryptocurrency.create(crypto)

  getCryptocurrencyHistory(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200 },
    data: []
  })
  expect(statusSpy).toHaveBeenCalledWith(200)

  done()
})

test(`Get history successfully`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  const marketQuotes = [
    {
      symbol: 'BTC',
      price: 10300,
      currency: 'EUR',
      timestamp: '2019-08-08T07:54:39.090Z'
    },
    {
      symbol: 'BTC',
      price: 10100,
      currency: 'EUR',
      timestamp: '2019-08-08T07:34:39.090Z'
    },
    {
      symbol: 'BTC',
      price: 10200,
      currency: 'EUR',
      timestamp: '2019-08-08T07:14:39.090Z'
    }
  ]
  await MarketQuote.insertMany(marketQuotes)

  getCryptocurrencyHistory(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200 },
    data: marketQuotes.map(m => _.omit(m, ['symbol']))
  })
  expect(statusSpy).toHaveBeenCalledWith(200)

  done()
})
